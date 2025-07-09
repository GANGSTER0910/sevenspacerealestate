from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class User(BaseModel):
    # username: str
    email: str
    password: str
    role: Optional[str] = "user"
    phone: str | int | None = None
    location: Optional[str] = None
    name : Optional[str] = None
    bio : Optional[str] = None

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
class User_forgot_password(BaseModel):
    email: str
    password: str

class User_change_password(BaseModel):
    email: str
    old_password: str
    new_password: str

# Model with all optional fields for partial updates (profile editing)
class UpdateUser(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    # Accept phone as string or int to avoid validation issues
    phone: str | int | None = None
    location: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = "user"
    password: Optional[str] = None

class GoogleTokenRequest(BaseModel):
    credential: str 

class GoogleUser(BaseModel):
    google_id: str
    email: str
    name: str
    picture: Optional[str] = None
    email_verified: bool = True