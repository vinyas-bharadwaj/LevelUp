from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import schemas, database, models

load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')

# Secret key
# Algorithm
# Expiration time

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'))

def create_access_token(data: dict):
  to_encode = data.copy()

  expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp": expire})

  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

  return encoded_jwt

def verify_access_token(token: str, credentials_exception):

  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    id: str = payload.get("user_id")
    
    token_data = schemas.TokenData(id=id)

  except JWTError:
    raise credentials_exception
  
  return token_data
  
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
  credentials_exception = HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                                        detail="could not validate credentials",
                                        headers={"WWW-Authenticate": "Bearer"})
  
  token = verify_access_token(token, credentials_exception)

  user = db.query(models.User).filter(models.User.id == token.id).first()
  
  return user