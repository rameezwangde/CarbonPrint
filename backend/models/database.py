from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import sqlite3
import os

# Database setup
DATABASE_URL = "sqlite:///./co2_predictions.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserSubmissionDB(Base):
    """Database model for user submissions"""
    __tablename__ = "user_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_data = Column(JSON)  # Store the full submission as JSON
    actual_co2 = Column(Float, nullable=True)  # Actual CO2 if available later
    predicted_co2 = Column(Float, nullable=True)  # Predicted CO2
    city = Column(String, index=True)
    area = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.now)
    
    # Key features for quick access
    body_type = Column(String)
    sex = Column(String)
    diet = Column(String)
    transport = Column(Float)
    vehicle_distance = Column(Float)
    grocery_bill = Column(Float)
    tv_pc_hours = Column(Float)
    internet_hours = Column(Float)
    waste_bag_count = Column(Integer)
    recycling_count = Column(Integer)  # Number of recycling materials

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully")

def get_connection():
    """Get direct SQLite connection for complex queries"""
    return sqlite3.connect("co2_predictions.db")
