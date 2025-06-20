from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4

class Property(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    description: str
    property_type: str  # e.g., "Apartment", "House", "Commercial"
    location: str
    price: float = Field(..., gt=0)  # Price should be greater than zero
    area_sqft: Optional[float] = None  # Area in square feet
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    amenities: Optional[List[str]] = []  # e.g., ["pool", "garden"]
    images: Optional[List[str]] = []  # List of image URLs
    listed_date: Optional[str] = None  # Date when the property was listed
    status: Optional[str] = "available"  # Default status is "available"
    owner_email: Optional[str] = None  # Email of the user who listed the property
