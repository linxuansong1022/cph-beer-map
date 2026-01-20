from sqlalchemy.orm import Session
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
        image_url=place.image_url
    )
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place
