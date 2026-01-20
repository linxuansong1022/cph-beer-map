from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, crud, database
from fastapi.middleware.cors import CORSMiddleware

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Cph Beer Map API")

# Configure CORS to allow requests from Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Cph Beer Map API"}

@app.get("/places", response_model=List[schemas.PlaceResponse])
def read_places(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    places = crud.get_places(db, skip=skip, limit=limit)
    return places

@app.post("/places", response_model=schemas.PlaceResponse)
def create_place(place: schemas.PlaceCreate, db: Session = Depends(database.get_db)):
    # Check if slug already exists
    db_place = db.query(models.Place).filter(models.Place.slug == place.slug).first()
    if db_place:
        raise HTTPException(status_code=400, detail="Place with this slug already exists")
    return crud.create_place(db=db, place=place)
