from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4

class User(BaseModel):
    # username: str
    email: str
    password: str
    role: Optional[str] = "user"
    phone: Optional[int] = None

class User_login(BaseModel):
    email : str
    password: str

class otp(BaseModel):
    email:str

class otp_verify(BaseModel):
    email: str
    otp: int
class admin(BaseModel):
    # name: str
    email:str
    role:Optional[str]="admin"
    password: str
            
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

class Agent(BaseModel):
    name: str
    email: str
    phone: str
    agency_name: Optional[str] = None
    properties_listed: Optional[List[str]] = []  # List of property IDs listed by the agent

class Announcement(BaseModel):
    title: str
    content: str
    img: str # URL for an image associated with the announcement
    by: str  # Name of the person or entity posting the announcement
    created_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    likes: Optional[int] = 0

class Transaction(BaseModel):
    property_id: str
    buyer_id: str  # ID of the buyer (User)
    seller_id: str  # ID of the seller (User or Agent)
    agent_id: Optional[str] = None  # ID of the agent if applicable
    sale_price: float  # Final price agreed upon for the property
    sale_date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    status: Optional[str] = "completed"  # Status could be "completed", "pending", "cancelled"

