from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

# Initialize database tables (ensure they exist)
models.Base.metadata.create_all(bind=engine)

# Data to seed
places_data = [
  {
    "slug": "warpigs",
    "name": "Warpigs Brewpub",
    "description": "Texas barbecue and American-Danish style beers.",
    "lat": 55.671, 
    "lng": 12.565,
    "category": "brewery",
    "website": "https://warpigs.dk",
    "logo_url": "https://www.google.com/s2/favicons?domain=warpigs.dk&sz=128"
  },
  {
    "slug": "brus",
    "name": "BRUS",
    "description": "Brewery, restaurant, bar and shop in Nørrebro.",
    "lat": 55.6923,
    "lng": 12.5562,
    "category": "brewery",
    "website": "https://tapperietbrus.dk",
    "logo_url": "https://www.google.com/s2/favicons?domain=tapperietbrus.dk&sz=128"
  },
  {
    "slug": "mikkeller-bar-viktoriagade",
    "name": "Mikkeller Bar",
    "description": "The original Mikkeller bar.",
    "lat": 55.6719,
    "lng": 12.5575,
    "category": "bar",
    "website": "https://mikkeller.com",
    "logo_url": "https://www.google.com/s2/favicons?domain=mikkeller.com&sz=128"
  },
  {
    "slug": "bootleggers-torvehallerne",
    "name": "Bootleggers Craft Beer Bar",
    "description": "Located at the beautiful Torvehallerne food market.",
    "lat": 55.6836,
    "lng": 12.5721,
    "category": "bar",
    "website": "https://bootleggers.dk",
    "logo_url": "https://www.google.com/s2/favicons?domain=bootleggers.dk&sz=128"
  }
]

def seed_db():
    db = SessionLocal()
    try:
        print("Seeding database...")
        for place_data in places_data:
            # Check if place already exists by slug
            existing_place = db.query(models.Place).filter(models.Place.slug == place_data["slug"]).first()
            
            if existing_place:
                print(f"Skipping {place_data['name']} (already exists) - UPDATING...")
                # Update existing record to reflect new logo_url
                for key, value in place_data.items():
                    setattr(existing_place, key, value)
                continue

            # Create new Place object
            new_place = models.Place(**place_data)
            db.add(new_place)
            print(f"Adding {place_data['name']}")
        
        db.commit()
        print("Seeding completed successfully.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()