from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# 格式: postgresql://user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = "postgresql://admin:password123@localhost:5432/cph_beer_map"

# 对于 PostgreSQL，不需要 connect_args={"check_same_thread": False}
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()