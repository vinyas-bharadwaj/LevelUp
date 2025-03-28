from fastapi import APIRouter, Query, File, UploadFile, HTTPException, status, Depends
from typing import List, Union, Dict
from enum import Enum
from sqlalchemy.orm import Session
from utils import get_summary_question_generator_agent, extract_text_from_file, SummaryQuestionGeneratorAgent
from schemas import ResponseQuestions
from models import Question, Test, User
from database import get_db, init_db
from oauth2 import get_current_user


router = APIRouter(
    prefix='/questions',
    tags=['questions']
)

class Difficulty(str, Enum):
    beginner = "beginner"
    easy = "easy"
    medium = "medium"
    hard = "hard"
    very_hard = "very hard"
    expert = "expert"


@router.post("/generate-questions", response_model=Dict[str, Union[List[ResponseQuestions], int]])
async def get_questions(
    file: UploadFile = File(...),
    num_questions: int = Query(5, title="Number of Questions"),
    difficulty: Difficulty = Query(..., title="Difficulty"),
    test_title: str = Query(..., title="Test Title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Get the logged-in user
    agent: SummaryQuestionGeneratorAgent = Depends(get_summary_question_generator_agent)  # Dependency injection for the agent
):
    """
    Generate multiple-choice questions based on the contents of the uploaded file and store them in the database under a test.
    The test is associated with the authenticated user.
    
    - **file**: Document containing content for question generation
    - **num_questions**: Number of questions to generate
    - **difficulty**: Difficulty level of the questions
    - **test_title**: Title for the test
    - **description**: Optional description for the test
    """
    try:
        extracted_text = extract_text_from_file(file)
        questions_data = await agent.generate_questions(extracted_text, num_questions, difficulty)

        # Create a new test entry associated with the authenticated user with the new fields
        new_test = Test(
            title=test_title,
            num_questions=num_questions,
            difficulty=difficulty.value,  # Store the string value from the enum
            user_id=current_user.id
        )
        db.add(new_test)
        db.commit()
        db.refresh(new_test)

        # Store generated questions in the database
        questions_to_store = []
        for q in questions_data:
            new_question = Question(
                question=q.question,
                option_a=q.option_a,
                option_b=q.option_b,
                option_c=q.option_c,
                option_d=q.option_d,
                answer=q.answer,
                test_id=new_test.id
            )
            questions_to_store.append(new_question)

        db.add_all(questions_to_store)
        db.commit()

        return {"questions": questions_data, "test_id": new_test.id}

    except Exception as e:
        db.rollback()  # Add rollback in case of error
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

@router.get("/my-tests")
async def get_my_tests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tests created by the logged-in user.
    """
    return db.query(Test).filter(Test.user_id == current_user.id).all()

@router.get("/{test_id}", response_model=List[ResponseQuestions])
def get_test_questions(test_id: int, db: Session = Depends(get_db)):
    """
    Get all questions associated with a test by test_id.
    """
    # Check if test exists
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    # Retrieve all questions for the given test ID
    questions = db.query(Question).filter(Question.test_id == test_id).all()

    return questions