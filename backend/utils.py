import logging
from pydantic_ai import settings as pydantic_ai_settings
from fastapi import UploadFile, HTTPException
from passlib.context import CryptContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai import Agent
from typing import List
import PyPDF2
import docx
import io
import json
import os
from dotenv import load_dotenv
from schemas import ResponseQuestions
from schemas import StudyPlanData

# Set the debug mode on
pydantic_ai_settings.debug = True

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("pydantic_ai").setLevel(logging.DEBUG)

load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashing and security
def hash(password: str):
    return pwd_context.hash(password)


def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Extracting text from files
def extract_text_from_file(file: UploadFile) -> str:
    """
    Extracts text from a given file (PDF, DOCX, TXT).
    """
    content = ""

    # Check file type
    if file.filename.endswith(".pdf"):
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.file.read()))
        content = "\n".join(page.extract_text() for page in pdf_reader.pages if page.extract_text())
    
    elif file.filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file.file.read()))
        content = "\n".join([para.text for para in doc.paragraphs])
    
    elif file.filename.endswith(".txt"):
        content = file.file.read().decode("utf-8")
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF, DOCX, or TXT file.")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Extracted text is empty.")

    return content

# Scraping the web for RAG
class WebScraper:
    async def search_web(self, query: str, num_results: int = 5) -> List[dict]:
        """
        Search the web for relevant information on the topic
        """
        try:
            import requests
            from bs4 import BeautifulSoup
            
            # Format search query
            search_query = f"{query} study guide curriculum syllabus"
            query_encoded = search_query.replace(" ", "+")
            
            # Perform search
            response = requests.get(
                f"https://www.google.com/search?q={query_encoded}", 
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code != 200:
                return []
            
            # Parse results
            soup = BeautifulSoup(response.text, "html.parser")
            search_results = []
            
            # Extract search result elements - adjust these selectors based on current Google HTML structure
            results = soup.select("div.g")
            
            for result in results[:num_results]:
                title_elem = result.select_one("h3")
                link_elem = result.select_one("a")
                snippet_elem = result.select_one("div.VwiC3b")
                
                if title_elem and link_elem and link_elem.get("href", "").startswith("http"):
                    title = title_elem.get_text()
                    url = link_elem.get("href")
                    snippet = snippet_elem.get_text() if snippet_elem else "No description available"
                    
                    search_results.append({
                        "title": title,
                        "url": url,
                        "snippet": snippet
                    })
            
            return search_results
        
        except Exception as e:
            print(f"Error searching web: {str(e)}")
            return []
    
    async def extract_content_from_url(self, url: str, max_chars: int = 4000) -> str:
        """
        Extract main text content from a webpage
        """
        try:
            import requests
            from bs4 import BeautifulSoup
            import re
            
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code != 200:
                return ""
            
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Remove script, style, and navigation elements
            for element in soup(["script", "style", "header", "footer", "nav"]):
                element.decompose()
            
            # Get text content
            text = soup.get_text(separator=" ", strip=True)
            
            # Clean up the text
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            text = " ".join(lines)
            
            # Remove excess whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Limit content length (LLMs have token limits)
            if len(text) > max_chars:
                text = text[:max_chars] + "..."
                
            return text
        
        except Exception as e:
            print(f"Error extracting content from {url}: {str(e)}")
            return ""


# Agent-related 
class SummaryQuestionGeneratorAgent:
    def __init__(self):
        self.model = GeminiModel('gemini-1.5-flash', api_key=API_KEY)
        self.web_scraper = WebScraper()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    async def _enhance_with_web_content(self, text: str, topic: str = None) -> str:
        """
        Enhances the input text with relevant web content for RAG.
        """
        if not topic:
            # Extract a topic from the text if none provided
            topic = text.split(".")[0] if "." in text else text[:50]
        
        # Search the web for additional information
        search_results = await self.web_scraper.search_web(topic, num_results=3)
        
        # Extract content from search results
        additional_content = []
        for result in search_results:
            content = await self.web_scraper.extract_content_from_url(result['url'], max_chars=2000)
            if content:
                additional_content.append({
                    "source": result['url'],
                    "title": result['title'],
                    "content": content
                })
        
        # Combine original text with additional content
        enhanced_text = text + "\n\n" + "\n\n".join([
            f"Additional information from {item['title']}:\n{item['content'][:1000]}" 
            for item in additional_content
        ])
        
        return enhanced_text

    async def generate_questions(self, text: str, num_questions: int = 5, difficulty: str = 'easy', topic: str = None) -> List[ResponseQuestions]:
        """
        Generates multiple-choice questions based on the given text.
        If use_rag is True, enhances the input with web content.
        """

        agent = Agent(
            self.model,
            result_type=List[ResponseQuestions],
            system_prompt=(
                f'You are a teacher tasked with creating {num_questions} multiple-choice questions on the following information: {text} '
                'Each question should have four options (a, b, c, d) and a correct answer.'
                f'Make sure the difficulty of each question is {difficulty}. '
                f'Focus your questions on the core text provided, using the additional information only for context and enrichment.'
                'Make use of the self._enhance_with_web_content function in order to retrieve additional information from the web.'
                'The questions should be clear, concise, and relevant to the text.'
            ),
            tools=[self._enhance_with_web_content]
        )

        response = await agent.run(text)
        return response.data
    
    async def summarize_text(self, text: str, word_length: int = 150, detail_level: str = 'medium', topic: str = None) -> str:
        """
        Summarizes the provided text based on specified word length and detail level.
        If use_rag is True, enhances the input with web content.
        """
            
        agent = Agent(
            self.model,
            result_type=str,
            system_prompt=(
                f"You are an expert summarizer who specializes in creating well-structured markdown documents. "
                f"Create a clear, organized summary of the following text in approximately {word_length} words. "
                f"The summary should be at a {detail_level} level of detail, where 'low' means only key points, "
                f"'medium' means important details and main ideas, and 'high' means comprehensive coverage of significant details. "
                
                f"Structure your response using these markdown formatting guidelines:\n"
                f"1. Begin with a level-1 heading (# ) for the main title\n"
                f"2. Use level-2 headings (## ) for major sections\n" 
                f"3. Use level-3 headings (### ) for subsections\n"
                f"4. Use bullet points (- ) for listing related items\n"
                f"5. Use numbered lists (1. ) for sequential or prioritized information\n"
                f"6. Use **bold text** for emphasis on key terms or concepts\n"
                f"7. Use *italics* for definitions or secondary emphasis\n"
                f"8. Use > blockquotes for important quotations or takeaways\n"
                f"9. Use horizontal rules (---) to separate major sections when appropriate\n"
                f"10. Use tables for comparing information when relevant\n\n"
                
                f"Maintain the original meaning and include the most important information from the text. "
                f"Create a logical hierarchy with clear sections and subsections. "
                f"Be comprehensive but concise, focusing on the most significant concepts. "
                f"While using supplementary information for context, prioritize the original text in your summary."
                "Make use of the self._enhance_with_web_content function in order to retrieve additional information from the web."
            ),
            tools=[self._enhance_with_web_content]
        )
        
        response = await agent.run(text)
        return response.data

def get_summary_question_generator_agent():
    """
    Returns an instance of the SummaryQuestionGeneratorAgent.
    """
    return SummaryQuestionGeneratorAgent()



class StudyPlanAgent:
    def __init__(self):
        self.model = GeminiModel('gemini-1.5-flash', api_key=API_KEY)
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        self.web_scraper = WebScraper()

    
    async def generate_study_plan(self, topic: str) -> StudyPlanData:
        """
        Generates a comprehensive study plan for the given topic
        """
        try:
            agent = Agent(
                self.model,
                result_type=StudyPlanData,  
                system_prompt=(
                    "You are an expert educational consultant specialized in creating comprehensive study plans. "
                    "Analyze the provided information about the topic and create a detailed, structured learning path. "
                    "Focus on organizing the content logically from foundational concepts to advanced applications. "
                    
                    "For the study plan, include these components:\n"
                    "1. An overview of the topic\n"
                    "2. Learning objectives\n"
                    "3. A progressive sequence of topics to study, from basic to advanced\n"
                    "4. Recommended resources (books, videos, websites, etc.) for each section\n"
                    "5. Practice exercises or activities for each section\n"
                    "6. Estimated time to complete each section\n"
                    "7. Assessment methods to check understanding\n"
                    
                    "The structure of your response should be well-organized with clear sections and subsections. "
                    "Make the plan adaptable for different learning styles."
                    "Make use of the web_scraper.extract_content_from_url function in order to retrieve additional information from the web."
                    "Make use of the web_scraper.search_web function in order to retrieve additional information from the web."
                ),
                tools=[self.web_scraper.extract_content_from_url, self.web_scraper.search_web]
            )
            
            response = await agent.run(topic)
            study_plan_data = response.data
            return study_plan_data
        
        except Exception as e:
            print(f"Error generating study plan: {str(e)}")
            # Return a valid StudyPlanData object with error information
            return StudyPlanData(
                topic=topic,
                overview=f"Could not generate study plan due to an error: {str(e)}",
                learning_objectives=[],
                sections=[],
                total_estimated_time="",
                error=str(e)
            )
    
    async def generate_quick_reference_guide(self, topic: str) -> str:
        """
        Generates a markdown-formatted quick reference guide for the given topic
        """
        try:

            agent = Agent(
                self.model,
                result_type=str,
                system_prompt=(
                    "You are an expert at creating concise, information-dense quick reference guides. "
                    "Create a markdown-formatted quick reference guide for the given topic. "
                    "The guide should be structured as follows:\n"
                    "1. A brief description of the topic (2-3 sentences)\n"
                    "2. Key concepts and definitions (use a table or bullet points)\n"
                    "3. Important formulas or principles (if applicable)\n"
                    "4. Common applications or use cases\n"
                    "5. Quick tips for remembering important aspects\n"
                    
                    "The guide should be comprehensive yet concise, suitable for printing on 1-2 pages. "
                    "Use markdown formatting for clear structure: headings, tables, code blocks, etc."
                    "Make use of the web_scraper.extract_content_from_url function in order to retrieve additional information from the web."
                    "Make use of the web_scraper.search_web function in order to retrieve additional information from the web."
                ),
                tools=[self.web_scraper.extract_content_from_url, self.web_scraper.search_web]

            )
            
            
            response = await agent.run(topic)
            return response.data
        
        except Exception as e:
            print(f"Error generating quick reference guide: {str(e)}")
            return f"# Error generating quick reference guide for {topic}\n\nThere was a problem creating your reference guide: {str(e)}"


def get_study_plan_agent():
    """
    Returns an instance of the StudyPlanAgent.
    """
    return StudyPlanAgent()


