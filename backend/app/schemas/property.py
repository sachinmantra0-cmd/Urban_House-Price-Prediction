from typing import List, Optional, Any
from pydantic import BaseModel, Field

class ImageItem(BaseModel):
    category: str
    caption: str
    url: str
    fallback: Optional[str] = None

class PropertyResponse(BaseModel):
    property_id: str
    title: str
    city: str
    locality: str
    property_type: str
    bhk: int
    bathrooms: int
    area_sqft: float
    balcony: int
    floor_number: Optional[int] = None
    total_floors: Optional[int] = None
    furnishing_status: Optional[str] = "Unfurnished"
    listed_price_inr: float
    listed_price_lakhs: float
    price_per_sqft: Optional[float] = None
    description: Optional[str] = ""
    primary_image: Optional[str] = None
    images: List[ImageItem] = []
    amenities: List[str] = []
    image_provenance: str = "Illustrative Demo Property Image (Permitted Sample)"
    is_demo_property: bool = True

class PropertyListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[PropertyResponse]

class CityStatResponse(BaseModel):
    city: str
    count: int
    avg_price_lakhs: float

class FavouriteRequest(BaseModel):
    property_id: str

class ComparisonRequest(BaseModel):
    property_id: str
