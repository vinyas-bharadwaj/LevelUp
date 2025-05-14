from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from models import Interview, User
from database import get_db
import os
from dotenv import load_dotenv
from schemas import InterviewCreate, InterviewReviewAnswers
from utils import InterviewAgent, get_interview_agent
from oauth2 import get_current_user
import json
import logging

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv('GEMINI_API_KEY')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/interviews",
    tags=["interviews"]
)


# Use InterviewResponse for the response model
@router.post("/generate-interview-questions", status_code=status.HTTP_201_CREATED)
async def create_interview_questions(
    # Use InterviewCreate for the input data
    interview_data: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    agent: InterviewAgent = Depends(get_interview_agent)
):
    """
    Generates interview questions using the agent based on input criteria
    and saves the resulting interview details to the database for the current user.
    """
    # Now 'Interview' unambiguously refers to the SQLAlchemy model
    try:
        logger.info(f"Generating interview questions for user {current_user.id} with data: {interview_data}")

        generated_questions = await agent.generate_interview_questions(
            role=interview_data.role,
            interview_type=interview_data.type,
            level=interview_data.level,
            techstack=interview_data.techstack,
            num_questions=interview_data.amount
        )

        if not generated_questions:
            logger.error("Interview generation agent returned no questions.")
            raise HTTPException(status_code=500, detail="Failed to generate interview questions.")

        logger.info(f"Successfully generated {len(generated_questions)} questions.")

        # Use the SQLAlchemy model 'Interview' here
        db_interview = Interview(
            role=interview_data.role,
            type=interview_data.type,
            level=interview_data.level,
            techstack=json.dumps(interview_data.techstack),
            questions=json.dumps(generated_questions), 
            user_id=current_user.id,
        )

        db.add(db_interview)
        db.commit()
        db.refresh(db_interview)

        logger.info(f"Successfully created interview record with ID: {db_interview.id}")

        # Return the SQLAlchemy object; FastAPI uses response_model to serialize
        return db_interview

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating interview questions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while generating or saving the interview: {str(e)}"
        )


# Use InterviewResponse for the response model list items
@router.get("/", status_code=status.HTTP_200_OK)
async def get_user_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves all interviews associated with the currently logged-in user.
    """
    # Now 'Interview' unambiguously refers to the SQLAlchemy model
    try:
        logger.info(f"Fetching interviews for user ID: {current_user.id}")
        # Use the SQLAlchemy model 'Interview' here
        interviews = db.query(Interview).filter(Interview.user_id == current_user.id).order_by(Interview.created_at.desc()).all()

        if not interviews:
            logger.info(f"No interviews found for user ID: {current_user.id}")
            return []

        logger.info(f"Found {len(interviews)} interviews for user ID: {current_user.id}")
        # Return the list of SQLAlchemy objects; FastAPI uses response_model
        return interviews

    except Exception as e:
        logger.error(f"Error fetching interviews for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching interviews: {str(e)}"
        )


@router.get("/{interview_id}", status_code=status.HTTP_200_OK)
async def get_interview_by_id(
    interview_id: int,
    db: Session = Depends(get_db)
    ):
    """
    Retrieves a specific interview by its ID for the currently logged-in user.
    """
    try:        
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
        ).first()
        
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview with ID {interview_id} not found"
            )
            
        logger.info(f"Successfully retrieved interview ID: {interview_id}")
        return interview
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error fetching interview ID {interview_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching the interview: {str(e)}"
        )


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletes a specific interview by its ID for the currently logged-in user.
    """
    try:
        logger.info(f"Attempting to delete interview ID: {interview_id} for user ID: {current_user.id}")
        
        interview_query = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == current_user.id
        )
        
        interview = interview_query.first()
        
        if not interview:
            logger.warning(f"Interview ID: {interview_id} not found for user ID: {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Interview with ID {interview_id} not found"
            )
            
        interview_query.delete(synchronize_session=False)
        db.commit()
        
        logger.info(f"Successfully deleted interview ID: {interview_id}")
        return {"message": "Interview deleted successfully"}
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting interview ID {interview_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while deleting the interview: {str(e)}"
        )

@router.post("/reviews/create", status_code=status.HTTP_201_CREATED)
async def review_interview(
    interview_data: InterviewReviewAnswers,
    agent: InterviewAgent = Depends(get_interview_agent),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a temporary review for an interview based on the provided questions and answers.
    The review is generated by the AI agent but not stored in the database.
    """
    try:
        logger.info(f"Generating interview review for user {current_user.id}")
        
        # Parse the questions and answers from the request data
        questions = interview_data.questions
        answers = interview_data.answers
        interview_id = interview_data.interview_id
        
        # Verify the interview exists and belongs to the current user
        if interview_id:
            interview = db.query(Interview).filter(
                Interview.id == interview_id,
                Interview.user_id == current_user.id
            ).first()
            
            if not interview:
                logger.warning(f"Interview with ID {interview_id} not found for user {current_user.id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Interview with ID {interview_id} not found or doesn't belong to current user"
                )
        else:
            # Require interview_id to be provided
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="interview_id is required"
            )
        
        # Generate the review using the agent
        reviews = await agent.review_interview(questions, answers)
        
        if not reviews:
            logger.error("Interview review generation agent returned no reviews.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Failed to generate interview review."
            )
        
        logger.info(f"Successfully generated reviews with {len(reviews)} evaluation points")
        print(reviews)
        # Return the generated reviews (without storing in database)
        return {
            "interview_id": interview_id,
            "reviews": reviews
        }
        
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions as-is
        raise http_exc
    except Exception as e:
        logger.error(f"Error in review_interview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during interview review: {str(e)}"
        )


