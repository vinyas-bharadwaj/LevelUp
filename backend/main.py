from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, auth, questions, summary

app = FastAPI()

origins = ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(summary.router)

@app.get('/')
def home():
    return "hello world"

