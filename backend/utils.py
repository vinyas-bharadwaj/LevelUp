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

