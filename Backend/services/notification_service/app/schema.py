from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
class Contact(BaseModel):
    name: str
    email: str
    subject: str
    content: str
    created_date: Optional[datetime] = Field(default_factory=datetime.utcnow)