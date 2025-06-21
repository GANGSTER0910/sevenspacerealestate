from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader
from typing import List, Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from datetime import datetime
import sys
import os
import httpx
from PIL import Image
from starlette.middleware.sessions import SessionMiddleware
import io
from app.auth import get_current_user, require_role
# from app.middleware import setup_middleware


load_dotenv()

app = FastAPI(
    title="Image Service",
    description="Microservice for handling image uploads and transformations",
    version="1.0.0"
)

# setup_middleware(app)
origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://sevenspacerealestate.vercel.app",
    "http://localhost:3000",
]  

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Secret_key = os.getenv("SECRET_KEY")
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)
url = os.getenv('url')
app.add_middleware(SessionMiddleware, secret_key=Secret_key)
SERVICE_NAME = "image_service"
SERVICE_URL = os.getenv('IMAGE_SERVICE_URL')

@app.on_event("startup")
async def startup_event():
    """Register service on startup"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}/register",
                params={"service_name": SERVICE_NAME, "service_url": SERVICE_URL}
            )
            if response.status_code == 200:
                print(f"Service {SERVICE_NAME} registered successfully")
    except Exception as e:
        print(f"Failed to register service: {str(e)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Unregister service on shutdown"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}/unregister",
                params={"service_name": SERVICE_NAME}
            )
            if response.status_code == 200:
                print(f"Service {SERVICE_NAME} unregistered successfully")
    except Exception as e:
        print(f"Failed to unregister service: {str(e)}")

# Models
class ImageResponse(BaseModel):
    url: str
    public_id: str
    created_at: datetime
    size: int = Field(..., description="Size of the image in bytes")
    format: str = Field(..., description="Image format (e.g., jpeg, png)")

class TransformResponse(BaseModel):
    url: str
    width: int
    height: int
    format: str = Field(..., description="Image format (e.g., jpeg, png)")

# Constants
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image(file: UploadFile) -> tuple[bytes, str, int]:
    """Validate image file and return its contents, format, and size"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"Unsupported image type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}")
    
    contents = file.file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(400, f"Image size exceeds maximum allowed size of {MAX_IMAGE_SIZE/1024/1024}MB")
    
    try:
        image = Image.open(io.BytesIO(contents))
        format = image.format.lower()
        if format not in ['jpeg', 'png', 'gif', 'webp']:
            raise HTTPException(400, "Invalid image format")
    except Exception as e:
        raise HTTPException(400, f"Invalid image file: {str(e)}")
    
    return contents, format, len(contents)

# Routes
@app.post("/upload", response_model=List[ImageResponse])
async def upload_image(
    file: List[UploadFile] = File(...),
    folder: str = "properties",
    # current_user: dict = Depends(get_current_user)
):
    try:
        responses=[]
        for i in file:
            contents, format, size = validate_image(i)
            result = cloudinary.uploader.upload(
                io.BytesIO(contents),
                folder=folder,
                resource_type="auto",
                format=format
            )
            responses.append(ImageResponse(
            url=result['secure_url'],
            public_id=result['public_id'],
            created_at=datetime.now(),
            size=size,
            format=format
        ))
        return responses
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(500, f"Failed to upload image: {str(e)}")

@app.get("/transform/{public_id}", response_model=TransformResponse)
async def transform_image(
    public_id: str,
    width: int = Query(300, ge=1, le=2000),
    height: int = Query(200, ge=1, le=2000),
    crop: str = Query("fill", pattern="^(fill|crop|scale|thumb)$"),
    format: Optional[str] = Query(None, pattern="^(jpeg|png|gif|webp)$"),
    # current_user: dict = Depends(get_current_user)
):
    """
    Transform an image with specified dimensions
    """
    try:
        # Generate transformed URL
        url = cloudinary.CloudinaryImage(public_id).build_url(
            width=width,
            height=height,
            crop=crop,
            format=format
        )
        return TransformResponse(
            url=url,
            width=width,
            height=height,
            format=format or "auto"
        )
    except Exception as e:
        raise HTTPException(500, f"Failed to transform image: {str(e)}")

@app.delete("/{public_id}")
async def delete_image(
    public_id: str,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Delete an image from Cloudinary (admin only)
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return {"message": "Image deleted successfully", "result": result}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": SERVICE_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv('PORT', '8003'))) 