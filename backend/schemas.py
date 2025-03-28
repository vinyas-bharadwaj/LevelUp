from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class BasePost(BaseModel):
    title: str
    content: str

class ResponsePost(BasePost):
    id: int
    title: str
    content: str

    model_config = {
        "from_attributes": True
    }

class CreateUser(BaseModel):
    username: str
    email: EmailStr
    password: str

class ResponseUser(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int]

class ResponseQuestions(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    answer: str

class SummaryResponse(BaseModel):
    id: int
    content: str
    original_filename: Optional[str]
    word_count: int
    detail_level: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class StudyPlanRequest(BaseModel):
    topic: str

class StudyPlanResource(BaseModel):
    title: str
    url: str
    description: str
    type: str

class StudyPlanSection(BaseModel):
    title: str
    description: str
    topics: List[str] = []
    resources: List[StudyPlanResource] = []
    activities: List[str] = []
    estimated_time: str
    assessment_methods: List[str] = []

class StudyPlanResponse(BaseModel):
    id: int
    topic: str
    overview: str
    learning_objectives: List[str]
    sections: List[StudyPlanSection]
    total_estimated_time: str
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }

class QuickReferenceResponse(BaseModel):
    id: int
    topic: str
    content: str
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }