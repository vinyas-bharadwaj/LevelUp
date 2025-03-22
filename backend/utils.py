from fastapi import UploadFile, HTTPException
from passlib.context import CryptContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai import Agent
from typing import List
import PyPDF2
import docx
import io
import os
from dotenv import load_dotenv
from schemas import ResponseQuestions

load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashing and security
def hash(password: str):
    return pwd_context.hash(password)


def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Agent-related functions
async def generate_questions(text: str, num_questions: int = 5, difficulty: str = 'easy') -> List[ResponseQuestions]:
    """
    Generates multiple-choice questions based on the given text.
    """
    model = GeminiModel('gemini-1.5-flash', api_key=API_KEY)
    agent = Agent(
        model, 
        result_type=List[ResponseQuestions],
        system_prompt=(
            f'You are a teacher tasked with creating {num_questions} multiple-choice questions on the following information: {text} '
            'Each question should have four options (a, b, c, d) and a correct answer.'
            f'Make sure the difficulty of each question is {difficulty}'
        )
    )

    response = await agent.run(text)  
    return response.data


async def summarize_text(text: str, word_length: int = 150, detail_level: str = 'medium') -> str:
    """
    Summarizes the provided text based on specified word length and detail level.
    """
    model = GeminiModel('gemini-1.5-flash', api_key=API_KEY)
    agent = Agent(
        model,
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
            f"Be comprehensive but concise, focusing on the most significant concepts."
        )
    )
    
    response = await agent.run(text)
    return response.data


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

