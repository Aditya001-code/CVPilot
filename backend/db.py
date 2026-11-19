import os
import sys

# Auto-resolve local venv site-packages if launched via system python
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_venv_site = os.path.join(_backend_dir, "venv", "Lib", "site-packages")
if os.path.exists(_venv_site) and _venv_site not in sys.path:
    sys.path.insert(0, _venv_site)

import json
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, scoped_session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
JWT_SECRET = os.getenv("JWT_SECRET", "")

# Ensure SQLAlchemy uses psycopg2 driver
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

Base = declarative_base()
engine = None
SessionLocal = None

if DATABASE_URL:
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10,
        )
        SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
        print("[CVPilot DB] Connected to Neon PostgreSQL engine.")
    except Exception as e:
        print(f"[CVPilot DB] Failed to create database engine: {e}")
        engine = None
        SessionLocal = None


# ==========================================================
# DATABASE MODELS
# ==========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("ResumeScan", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ResumeScan(Base):
    __tablename__ = "resume_scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    filename = Column(String(255), default="Resume.pdf")
    score = Column(Integer, default=0)
    grade = Column(String(30), default="N/A")
    target_role = Column(String(120), default="")
    candidate_email = Column(String(150), default="")
    candidate_phone = Column(String(50), default="")
    skills = Column(JSON, default=list)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    ai_analysis = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scans")

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "score": self.score,
            "grade": self.grade,
            "target_role": self.target_role,
            "email": self.candidate_email,
            "phone": self.candidate_phone,
            "skills": self.skills or [],
            "matched_skills": self.matched_skills or [],
            "missing_skills": self.missing_skills or [],
            "suggestions": self.suggestions or [],
            "ai_analysis": self.ai_analysis or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==========================================================
# INITIALIZATION
# ==========================================================

def init_db():
    if engine:
        try:
            Base.metadata.create_all(bind=engine)
            print("[CVPilot DB] Neon tables initialized successfully (users, resume_scans).")
        except Exception as e:
            print(f"[CVPilot DB] Error creating tables on Neon: {e}")


def get_db():
    if not SessionLocal:
        return None
    db = SessionLocal()
    try:
        return db
    finally:
        pass


# ==========================================================
# JWT AUTHENTICATION HELPERS
# ==========================================================

def create_jwt_token(user_id, email, name):
    payload = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        print("[CVPilot Auth] JWT token has expired.")
        return None
    except Exception as e:
        print(f"[CVPilot Auth] Invalid JWT token: {e}")
        return None


def get_current_user_from_request():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1].strip()
    payload = decode_jwt_token(token)
    if not payload or "user_id" not in payload:
        return None

    db = get_db()
    if not db:
        return None

    try:
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        if user:
            # Expunge from session so attributes remain accessible in memory
            db.expunge(user)
            return user
        return None
    except Exception as e:
        print(f"[CVPilot DB] get_current_user error: {e}")
        return None
    finally:
        db.close()
