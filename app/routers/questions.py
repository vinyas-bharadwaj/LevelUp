from fastapi import APIRouter, Query, File, UploadFile, HTTPException, status, Depends
from typing import List
from enum import Enum
from sqlalchemy.orm import Session
from ..utils import generate_questions, extract_text_from_file
from ..schemas import ResponseQuestions
from ..models import Question, Test, User
from ..database import get_db, init_db
from ..oauth2 import get_current_user


router = APIRouter(
    prefix='/questions',
    tags=['questions']
)

init_db()

class Difficulty(str, Enum):
    beginner = "beginner"
    easy = "easy"
    medium = "medium"
    hard = "hard"
    very_hard = "very hard"
    expert = "expert"


@router.post("/generate-questions", response_model=List[ResponseQuestions])
async def get_questions(
    file: UploadFile = File(...),
    num_questions: int = Query(5, title="Number of Questions"),
    difficulty: Difficulty = Query(..., title="Difficulty"),
    test_title: str = Query(..., title="Test Title"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Get the logged-in user
):
    """
    Generate multiple-choice questions based on the contents of the uploaded file and store them in the database under a test.
    The test is associated with the authenticated user.
    """
    try:
        extracted_text = extract_text_from_file(file)
        questions_data = await generate_questions(extracted_text, num_questions, difficulty)

        # Create a new test entry associated with the authenticated user
        new_test = Test(title=test_title, user_id=current_user.id)
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

        return questions_data

    except Exception as e:
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

@router.get("/{test_id}/questions", response_model=List[ResponseQuestions])
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