from sqlalchemy.orm import Session
from sqlalchemy import text
from . import models, schemas

def get_places(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Place).offset(skip).limit(limit).all()

def create_place(db: Session, place: schemas.PlaceCreate):
    db_place = models.Place(
        slug=place.slug,
        name=place.name,
        description=place.description,
        lat=place.lat,
        lng=place.lng,
        category=place.category,
        website=place.website,
        logo_url=place.logo_url,
        image_url=place.image_url,
        google_place_id=place.google_place_id,
        rating=place.rating,
        user_ratings_total=place.user_ratings_total
    )
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

def delete_place_by_slug(db: Session, slug: str):
    db_place = db.query(models.Place).filter(models.Place.slug == slug).first()
    if db_place:
        db.delete(db_place)
        db.commit()
        return True
    return False

def get_places_nearby(db: Session, lat: float, lng: float, radius_meters: int = 2000):
    stmt = text("""
        SELECT * FROM places 
        WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :radius
        )
    """)
    result = db.execute(stmt, {"lat": lat, "lng": lng, "radius": radius_meters})
    
    # Map raw result rows to objects compatible with Pydantic model
    places = []
    for row in result:
        # row is a Row object, can be accessed by attribute name in recent SQLAlchemy
        places.append(row)
        
    return places