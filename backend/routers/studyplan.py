from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import StudyPlan, User
from schemas import StudyPlanRequest, StudyPlanResponse, QuickReferenceResponse
from utils import StudyPlanAgent, get_study_plan_agent  # Import the dependency function
from oauth2 import get_current_user
import json

router = APIRouter(
    prefix='/studyplan',
    tags=['study plan']
)

@router.post('/generate-studyplan/', response_model=StudyPlanResponse)
async def generate_studyplan(
    request: StudyPlanRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    study_plan_agent: StudyPlanAgent = Depends(get_study_plan_agent)  # Use dependency injection
):
    """
    Generate a study plan for a given topic and save it to the database
    """
    # Generate study plan
    study_plan_data = await study_plan_agent.generate_study_plan(request.topic)
    
    # Generate quick reference guide
    quick_ref_data = await study_plan_agent.generate_quick_reference_guide(request.topic)
    
    # Convert Pydantic model to dict, then to JSON string for storage
    study_plan_json = json.dumps(study_plan_data.model_dump())
    
    # Create new study plan in database
    new_study_plan = StudyPlan(
        topic=request.topic,
        content=study_plan_json,
        quick_reference=quick_ref_data,
        user_id=current_user.id
    )
    
    db.add(new_study_plan)
    db.commit()
    db.refresh(new_study_plan)
    
    # Parse JSON back to dict for response
    study_plan_dict = json.loads(new_study_plan.content)
    
    # Format response data
    response_data = {
        "id": new_study_plan.id,
        "topic": new_study_plan.topic,
        "overview": study_plan_dict.get("overview", ""),
        "learning_objectives": study_plan_dict.get("learning_objectives", []),
        "sections": study_plan_dict.get("sections", []),
        "total_estimated_time": study_plan_dict.get("total_estimated_time", ""),
        "created_at": new_study_plan.created_at
    }
    
    return response_data

@router.get('/', response_model=List[StudyPlanResponse])
async def get_user_studyplans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all study plans for the current user
    """
    study_plans = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id).all()
    
    response_data = []
    for plan in study_plans:
        # Parse JSON back to dict
        plan_dict = json.loads(plan.content)
        
        # Format response data
        plan_data = {
            "id": plan.id,
            "topic": plan.topic,
            "overview": plan_dict.get("overview", ""),
            "learning_objectives": plan_dict.get("learning_objectives", []),
            "sections": plan_dict.get("sections", []),
            "total_estimated_time": plan_dict.get("total_estimated_time", ""),
            "created_at": plan.created_at
        }
        response_data.append(plan_data)
    
    return response_data

@router.get('/{plan_id}', response_model=StudyPlanResponse)
async def get_studyplan(
    plan_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a specific study plan by ID
    """
    study_plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
    ).first()
    
    if not study_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study plan with ID {plan_id} not found"
        )
    
    # Parse JSON back to dict
    plan_dict = json.loads(study_plan.content)
    
    # Format response data
    response_data = {
        "id": study_plan.id,
        "topic": study_plan.topic,
        "overview": plan_dict.get("overview", ""),
        "learning_objectives": plan_dict.get("learning_objectives", []),
        "sections": plan_dict.get("sections", []),
        "total_estimated_time": plan_dict.get("total_estimated_time", ""),
        "created_at": study_plan.created_at
    }
    
    return response_data

@router.get('/{plan_id}/reference', response_model=QuickReferenceResponse)
async def get_quick_reference(
    plan_id: int,
    db: Session = Depends(get_db),
):
    """
    Get the quick reference guide for a specific study plan
    """
    study_plan = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
    ).first()
    
    if not study_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study plan with ID {plan_id} not found"
        )
    
    if not study_plan.quick_reference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quick reference guide not found for this study plan"
        )
    
    return {
        "id": study_plan.id,
        "topic": study_plan.topic,
        "content": study_plan.quick_reference,
        "created_at": study_plan.created_at
    }

@router.delete('/{plan_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_studyplan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a study plan
    """
    study_plan_query = db.query(StudyPlan).filter(
        StudyPlan.id == plan_id,
        StudyPlan.user_id == current_user.id
    )
    
    study_plan = study_plan_query.first()
    
    if not study_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study plan with ID {plan_id} not found"
        )
    
    study_plan_query.delete(synchronize_session=False)
    db.commit()