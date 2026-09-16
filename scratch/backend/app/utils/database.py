"""Database connection and session utilities for SQLite prototype."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.utils.config import settings

import os

# SQLite configuration (check_same_thread=False is needed for multi-threaded FastAPI handlers)
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite:////"):
    rel_path = db_url.replace("sqlite:///", "")
    if not os.path.isabs(rel_path):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        abs_path = os.path.join(backend_dir, rel_path)
        db_url = f"sqlite:///{abs_path.replace(os.sep, '/')}"

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize all tables defined in models metadata."""
    from app.models import Base
    Base.metadata.create_all(bind=engine)

