from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import requests
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

# --- Google Places API Configuration ---
# TODO: Replace with your actual API Key or load from environment variable
GOOGLE_API_KEY = "AIzaSyDQ6-MjS8UPSRMrJ8xYqs6sEXQ4WJCWLdI"

def get_google_photo_url(query: str) -> str | None:
    """
    Searches for a place by text query and returns its first photo URL.
    """
    if not GOOGLE_API_KEY or GOOGLE_API_KEY == "YOUR_GOOGLE_API_KEY":
        return None

    try:
        # 1. Search for the place to get photo_reference
        search_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
        params = {
            "input": query,
            "inputtype": "textquery",
            "fields": "photos",
            "key": GOOGLE_API_KEY
        }
        response = requests.get(search_url, params=params)
        data = response.json()
        
        # Debug Logs
        print(f"Google API Status for '{query}': {data.get('status')}")
        if data.get('error_message'):
            print(f"Error Message: {data.get('error_message')}")

        if data.get("status") == "OK" and data.get("candidates"):
            candidate = data["candidates"][0]
            if "photos" in candidate:
                photo_ref = candidate["photos"][0]["photo_reference"]
                # 2. Construct the direct photo URL
                # Note: We don't fetch this URL because it redirects to the actual image.
                # We can just store this API URL, but the browser needs to be able to access it.
                # A Google Places Photo URL looks like this:
                return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={photo_ref}&key={GOOGLE_API_KEY}"
            else:
                print("No photos found in candidate.")
    except Exception as e:
        print(f"Error fetching Google Photo: {e}")
        return None
    
    return None

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
    
    # Intelligent Logo Filling:
    # If no logo, OR if it's a generated placeholder (UI Avatar), OR if it's a low-res Favicon,
    # we try to upgrade to a high-quality Google Place Photo.
    should_fetch_google = (
        not place.logo_url or 
        "ui-avatars.com" in place.logo_url or 
        "google.com/s2/favicons" in place.logo_url
    )

    if should_fetch_google:
        print(f"Fetching Google Photo for {place.name}...")
        google_photo = get_google_photo_url(f"{place.name} Copenhagen")
        if google_photo:
            place.logo_url = google_photo
            
    return crud.create_place(db=db, place=place)

@app.delete("/places/{slug}")
def delete_place(slug: str, db: Session = Depends(database.get_db)):
    success = crud.delete_place_by_slug(db, slug=slug)
    if not success:
        raise HTTPException(status_code=404, detail="Place not found")
    return {"message": "Place deleted successfully"}
