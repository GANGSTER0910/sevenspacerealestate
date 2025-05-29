from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import cloudinary
import cloudinary.uploader
from typing import List, Optional
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
import sys
import os
import httpx

# Add the common directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from common.auth import get_current_user, require_role
from common.middleware import setup_middleware
from common.service_discovery import service_registry

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Image Service",
    description="Microservice for handling image uploads and transformations",
    version="1.0.0"
)

# Setup middleware
setup_middleware(app)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Service registration
SERVICE_NAME = "image-service"
SERVICE_URL = f"http://localhost:{os.getenv('PORT', '8003')}"

@app.on_event("startup")
async def startup_event():
    """Register service on startup"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8000/register",
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
                "http://localhost:8000/unregister",
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

class TransformResponse(BaseModel):
    url: str
    width: int
    height: int

# Routes
@app.post("/upload", response_model=ImageResponse)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = "properties",
    current_user: dict = Depends(get_current_user)
):
    """
    Upload an image to Cloudinary
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(400, "File must be an image")
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type="auto"
        )
        
        return ImageResponse(
            url=result['secure_url'],
            public_id=result['public_id'],
            created_at=datetime.now()
        )
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/transform/{public_id}", response_model=TransformResponse)
async def transform_image(
    public_id: str,
    width: int = 300,
    height: int = 200,
    crop: str = "fill",
    current_user: dict = Depends(get_current_user)
):
    """
    Transform an image with specified dimensions
    """
    try:
        # Generate transformed URL
        url = cloudinary.CloudinaryImage(public_id).build_url(
            width=width,
            height=height,
            crop=crop
        )
        return TransformResponse(
            url=url,
            width=width,
            height=height
        )
    except Exception as e:
        raise HTTPException(500, str(e))

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