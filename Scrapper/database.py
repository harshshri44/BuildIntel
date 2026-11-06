import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from root or Scrapper directory if present
current_dir = Path(__file__).resolve().parent
root_env = current_dir.parent / ".env"
local_env = current_dir / ".env"

if root_env.exists():
    load_dotenv(dotenv_path=root_env)
if local_env.exists():
    load_dotenv(dotenv_path=local_env)

# Build PostgreSQL database connection URL using psycopg v3 driver
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", ""),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", "5432")),
    database=os.getenv("DB_NAME", "buildintel_db"),
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

Base = declarative_base()
