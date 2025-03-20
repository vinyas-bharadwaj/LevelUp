from fastapi import APIRouter, Query, File, UploadFile, HTTPException, status, Depends
from utils import summarize_text, extract_text_from_file
from typing import Optional, List
from schemas import SummaryResponse
from sqlalchemy.orm import Session
from database import get_db, init_db
import models
from oauth2 import get_current_user


router = APIRouter(
    prefix='/summary',
    tags=['summary']
)

init_db()


@router.post("/generate-summary", response_model=SummaryResponse)
async def summarize(
    file: UploadFile = File(...),
    word_length: Optional[int] = Query(150, description="Target word count for the summary"),
    detail_level: Optional[str] = Query(
        "medium", 
        description="Level of detail (low, medium, high)"
    ),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Summarize text from an uploaded file.
    
    - **file**: The document to summarize (PDF, DOCX, TXT supported)
    - **word_length**: Target length of the summary in words
    - **detail_level**: Level of detail in the summary (low, medium, high)
    """
    # Validate detail level
    if detail_level not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="detail_level must be one of: low, medium, high"
        )
    
    try:
        # Extract text from the uploaded file
        text = extract_text_from_file(file)
        
        if not text or len(text.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text could be extracted from the file"
            )
        
        # Generate summary
        summary_content = await summarize_text(
            text=text,
            word_length=word_length,
            detail_level=detail_level
        )
        
        # Create and save the summary in the database
        new_summary = models.Summary(
            content=summary_content, 
            original_filename=file.filename,
            word_count=word_length,
            detail_level=detail_level,
            user_id=current_user.id
        )
        
        db.add(new_summary)
        db.commit()
        db.refresh(new_summary)
        
        return new_summary
        
    except Exception as e:
        db.rollback()  # Rollback the transaction in case of error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the file: {str(e)}"
        )

@router.get("/", response_model=List[SummaryResponse])
async def get_user_summaries(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all summaries created by the current user.
    
    Returns a list of summaries ordered by creation date (newest first).
    """
    summaries = db.query(models.Summary).filter(
        models.Summary.user_id == current_user.id
    ).order_by(models.Summary.created_at.desc()).all()
    
    return summaries

# Get a specific summary by ID
@router.get("/{summary_id}", response_model=SummaryResponse)
async def get_summary_by_id(
    summary_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific summary by ID.
    
    - **summary_id**: The ID of the summary to retrieve
    """
    summary = db.query(models.Summary).filter(
        models.Summary.id == summary_id,
        models.Summary.user_id == current_user.id
    ).first()
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Summary with ID {summary_id} not found or you don't have access to it"
        )
    
    return summary

# Delete a summary
@router.delete("/{summary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_summary(
    summary_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a summary.
    
    - **summary_id**: The ID of the summary to delete
    """
    summary_query = db.query(models.Summary).filter(
        models.Summary.id == summary_id,
        models.Summary.user_id == current_user.id
    )
    
    summary = summary_query.first()
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Summary with ID {summary_id} not found or you don't have access to it"
        )
    
    summary_query.delete(synchronize_session=False)
    db.commit()
    
    return None