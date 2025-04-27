from fastapi import FastAPI
import uvicorn
import logging
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import users, auth, questions, summary, studyplan, interview

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("app")

app = FastAPI(
    title="LevelUp Learning API",
    description="API for LevelUp Learning application",
    version="1.0.0",
)

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
app.include_router(studyplan.router)
app.include_router(interview.router)

# Event handlers
@app.on_event("startup")
async def startup_event():
    logger.info("Application startup")
    init_db()
    # Log your router registrations for debugging
    logger.info("Registered routes:")
    for route in app.routes:
        logger.info(f"Route: {route.path} [{', '.join(route.methods)}]")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown")

@app.get('/')
def home():
    return "hello world"

@app.post('/testing')
def testing(sentence: str):
    return {"message": sentence}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )

