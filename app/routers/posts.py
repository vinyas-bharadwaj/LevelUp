from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, init_db
from ..models import Post
from ..schemas import BasePost, ResponsePost
from ..oauth2 import get_current_user


router = APIRouter(
    prefix='/posts',
    tags=['posts']
)

init_db()

@router.get('/', response_model=List[ResponsePost])
def get_posts(db: Session = Depends(get_db), user: int = Depends(get_current_user)):
    posts = db.query(Post).filter(Post.owner_id == user.id).all()
    return posts

@router.post('/', response_model=ResponsePost)
def create_post(post: BasePost, db: Session = Depends(get_db), user: int = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail=f"unauthorized user")

    new_post = Post(**post.model_dump(), owner_id=user.id) 
    db.add(new_post)
    db.commit() 
    db.refresh(new_post)

    return new_post
