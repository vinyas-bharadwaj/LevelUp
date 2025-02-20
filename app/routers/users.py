from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db, init_db
from ..models import User
from ..schemas import CreateUser, ResponseUser
from ..utils import hash

router = APIRouter(
    prefix='/users',
    tags=['users']
)


@router.post('/', response_model=ResponseUser, status_code=status.HTTP_201_CREATED)
def create_user(user: CreateUser, db: Session = Depends(get_db)):
    hashed_password = hash(user.password)
    user.password = hashed_password

    new_user = User(**user.model_dump()) 
    db.add(new_user)
    db.commit() 
    db.refresh(new_user)

    return new_user

@router.get('/{id}', response_model=ResponseUser)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()

    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"user with id: {id} does not exist")

    return user

