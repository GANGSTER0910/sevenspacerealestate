from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

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