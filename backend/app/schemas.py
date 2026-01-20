from pydantic import BaseModel, computed_field
from typing import Optional, List, Literal

# Shared properties
class PlaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Literal['brewery', 'bar', 'shop']
    website: Optional[str] = None
    logo_url: Optional[str] = None
    image_url: Optional[str] = None
    lat: float
    lng: float

# Properties to receive on place creation
class PlaceCreate(PlaceBase):
    slug: str

# Properties to return to client
class PlaceResponse(PlaceBase):
    id: int
    slug: str

    # Converts lat/lng back to [lat, lng] array for frontend compatibility
    @computed_field
    def position(self) -> List[float]:
        return [self.lat, self.lng]

    class Config:
        from_attributes = True
