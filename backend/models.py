from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean # Added Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import TIMESTAMP
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)

    # Establish relationship with Test model
    tests = relationship("Test", back_populates="user")

    # Establish relationship with Summary model
    summaries = relationship("Summary", back_populates="user")

    # Establish relationship with StudyPlan model
    studyplans = relationship("StudyPlan", back_populates="user")

    # Establish relationship with Interview model
    interviews = relationship("Interview", back_populates="user") # Added relationship


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question = Column(String, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    test_id = Column(Integer, ForeignKey("tests.id", ondelete="CASCADE"), nullable=False)

    # Relationship with Test
    test = relationship("Test", back_populates="questions")


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    num_questions = Column(Integer, nullable=False)
    difficulty = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="tests")

    # Relationship with Question
    questions = relationship("Question", back_populates="test", cascade="all, delete")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    original_filename = Column(String, nullable=True)
    word_count = Column(Integer, nullable=False)
    detail_level = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="summaries")


class StudyPlan(Base):
    __tablename__ = "studyplans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    topic = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    quick_reference = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="studyplans")


# New Interview Model
class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role = Column(String, nullable=False)
    type = Column(String, nullable=False) # e.g., "behavioural", "technical"
    level = Column(String, nullable=False) # e.g., "junior", "senior"
    # Storing lists as JSON strings in a Text field is common
    techstack = Column(Text, nullable=False) # Store as JSON string '["Python", "FastAPI"]'
    questions = Column(Text, nullable=False) # Store as JSON string '["Q1", "Q2"]'
    finalized = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="interviews")


