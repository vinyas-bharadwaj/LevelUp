from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import database, schemas, models, utils, oauth2

router = APIRouter(
    prefix='/login',
    tags=['login']
)

@router.post('/', response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.username == user_credentials.username).first()

    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"user with username: {user_credentials.username} does not exist")
    
    if not utils.verify(user_credentials.password, user.password):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail=f"invalid credentials")

    access_token = oauth2.create_access_token(data={"user_id": user.id})

    return {"access_token": access_token, "token_type": "bearer"}