from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    # Mapping to the string ID used in frontend (e.g., 'warpigs')
    slug = Column(String, unique=True, index=True) 
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    
    # Storing position as separate lat/lng in DB
    lat = Column(Float)
    lng = Column(Float)
    
    category = Column(String) # 'brewery', 'bar', 'shop'
    website = Column(String, nullable=True)
    
    # Google Places Data
    google_place_id = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    user_ratings_total = Column(Integer, nullable=True)

    logo_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
