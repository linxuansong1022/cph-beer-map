import requests
import time
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

# Initialize database
models.Base.metadata.create_all(bind=engine)

# --- CONFIGURATION ---
# Replace with your actual API Key
GOOGLE_API_KEY = "AIzaSyDQ6-MjS8UPSRMrJ8xYqs6sEXQ4WJCWLdI"
# Copenhagen City Center
CENTER_LAT = 55.6761
CENTER_LNG = 12.5683
RADIUS = 5000  # 5km radius
KEYWORD = "craft beer"

def import_bars():
    db = SessionLocal()
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    params = {
        "location": f"{CENTER_LAT},{CENTER_LNG}",
        "radius": RADIUS,
        "keyword": KEYWORD,
        "type": "bar",
        "key": GOOGLE_API_KEY
    }

    try:
        print(f"🌍 Searching for '{KEYWORD}' bars within {RADIUS}m of Copenhagen...")
        
        while True:
            response = requests.get(url, params=params)
            data = response.json()
            
            if data.get("status") != "OK":
                print(f"❌ API Error: {data.get('status')} - {data.get('error_message')}")
                break

            results = data.get("results", [])
            print(f"📦 Found {len(results)} places in this page.")

            for place in results:
                process_place(db, place)
            
            # Commit after each page
            db.commit()

            # Handle Pagination (Google returns max 20 per page)
            next_page_token = data.get("next_page_token")
            if not next_page_token:
                break
            
            print("⏳ Waiting for next page token to become valid...")
            time.sleep(2) # Google requires a short delay before next_page_token is valid
            params = {
                "pagetoken": next_page_token,
                "key": GOOGLE_API_KEY
            }

        print("✅ Import completed!")

    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
    finally:
        db.close()

def process_place(db: Session, place_data):
    name = place_data.get("name")
    place_id = place_data.get("place_id")
    
    # Check duplicates
    existing = db.query(models.Place).filter(models.Place.name == name).first()
    if existing:
        print(f"   ⚠️ Skipping {name} (Already exists)")
        return

    # Extract details
    location = place_data.get("geometry", {}).get("location", {})
    lat = location.get("lat")
    lng = location.get("lng")
    rating = place_data.get("rating")
    user_ratings_total = place_data.get("user_ratings_total")
    
    # Construct Photo URL if available
    photo_url = None
    if "photos" in place_data:
        photo_ref = place_data["photos"][0]["photo_reference"]
        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference={photo_ref}&key={GOOGLE_API_KEY}"

    # Create Slug (simple lowercase hyphenated)
    slug = name.lower().replace(" ", "-").replace("ø", "o").replace("æ", "ae").replace("å", "aa")
    # Remove weird chars
    slug = "".join(c for c in slug if c.isalnum() or c == "-")

    # Create DB Object
    new_place = models.Place(
        slug=slug,
        name=name,
        description=f"Rating: {rating} ⭐ ({user_ratings_total} reviews)", # Simple description
        lat=lat,
        lng=lng,
        category="bar", # Default to bar
        rating=rating,
        user_ratings_total=user_ratings_total,
        google_place_id=place_id,
        logo_url=photo_url, # Use photo as logo
        image_url=photo_url
    )
    
    db.add(new_place)
    print(f"   ✅ Added: {name}")

if __name__ == "__main__":
    import_bars()
