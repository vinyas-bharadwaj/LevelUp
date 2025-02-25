from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


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
