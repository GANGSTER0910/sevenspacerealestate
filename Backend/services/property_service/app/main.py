from datetime import datetime, timedelta, timezone
from fastapi import *
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pymongo import *
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from jwt import JWT, jwk_from_dict
from typing import Optional, List
from bson import ObjectId
from schema import *
import gridfs
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError
from jwt.exceptions import JWTDecodeError
import httpx

app = FastAPI(
    title="Property Service",
    description="Microservice for handling property listings and management",
    version="1.0.0"
)
load_dotenv()

# Service registration
SERVICE_NAME = "property_service"
SERVICE_URL = f"http://property_service:8002"

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://sevenspacerealestate.vercel.app",
    "http://localhost:3000",
]  

Secret_key = os.getenv("SECRET_KEY")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

link = os.getenv("Database_Link")
client1 = MongoClient(link)
db1 = client1['SSRealEstate']
fs = gridfs.GridFS(db1)

app.add_middleware(SessionMiddleware, secret_key=Secret_key)

@app.on_event("startup")
async def startup_event():
    """Register service on startup"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://api_gateway:8000/register",
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
                "http://api_gateway:8000/unregister",
                params={"service_name": SERVICE_NAME}
            )
            if response.status_code == 200:
                print(f"Service {SERVICE_NAME} unregistered successfully")
    except Exception as e:
        print(f"Failed to unregister service: {str(e)}")

def validate_property_data(property_data: dict) -> None:
    """Validate property data"""
    if not property_data.get("title"):
        raise HTTPException(status_code=400, detail="Title is required")
    if not property_data.get("description"):
        raise HTTPException(status_code=400, detail="Description is required")
    if not property_data.get("property_type"):
        raise HTTPException(status_code=400, detail="Property type is required")
    if not property_data.get("location"):
        raise HTTPException(status_code=400, detail="Location is required")
    if not property_data.get("price") or property_data["price"] <= 0:
        raise HTTPException(status_code=400, detail="Valid price is required")

@app.post("/property")
async def add_property(property: Property, files: List[UploadFile] = File(...)):
    try:
        # Validate property data
        property_data = property.dict()
        validate_property_data(property_data)

        # Process images
        image_ids = []
        for file in files:
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
            image_id = fs.put(file.file, filename=file.filename)
            image_ids.append(str(image_id))

        # Normalize title and location
        normalized_title = property.title.strip().lower()
        normalized_location = property.location.strip()

        # Check for existing property
        existing_property = db1.get_collection('Property').find_one(
            {"title": normalized_title, "location": normalized_location},
            {"_id": 0}
        )
        if existing_property:
            raise HTTPException(status_code=400, detail="Property already exists")

        # Prepare property data
        property_data["images"] = image_ids
        property_data["title"] = normalized_title
        property_data["location"] = normalized_location
        if not property_data.get("listed_date"):
            property_data["listed_date"] = datetime.now().strftime("%Y-%m-%d")

        # Insert property
        result = db1.get_collection('Property').insert_one(property_data)
        property_data["_id"] = str(result.inserted_id)

        return {"message": "Property added successfully", "property": jsonable_encoder(property_data)}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add property: {str(e)}")

@app.get("/property/category")
async def get_property_by_category(category: str, status: str = "available"):
    query = {"property_type": category}

    if status:  
        query["status"] = status

    properties = list(db1.get_collection('Property').find(query))
    for property in properties:
        property["_id"] = str(property["_id"])

    return {"count": len(properties), "properties": jsonable_encoder(properties)}

@app.get("/property/all")
async def get_all_properties(status: str = "available"):
    query = {"status": status}
    properties = list(db1.get_collection('Property').find(query))
    for property in properties:
        property["_id"] = str(property["_id"])
    return {"count": len(properties), "properties": jsonable_encoder(properties)}

@app.get("/property/home")
async def get_home_properties():
    query = {"status": "available"}
    sort_criteria = [("listed_date", -1)] # -1 for descending order (recently added)
    limit = 8
    
    cursor = db1.get_collection("Property").find(query).sort(sort_criteria).limit(limit)
    properties = list(cursor)
    
    for property in properties:
        property["_id"] = str(property["_id"])
        
    return {"count": len(properties), "properties": jsonable_encoder(properties)}
@app.get("/property/{property_id}")
async def get_property(property_id: str):
    try:
        property_data = db1.get_collection('Property').find_one({"_id": ObjectId(property_id)})
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        property_data["_id"] = str(property_data["_id"])
        return property_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/property/edit/{property_id}")
async def get_property_for_edit(property_id: str, property: Property):
    try:
        property_data = db1.get_collection('Property').find_one({"_id": ObjectId(property_id)})
        property1_data = property.dict()
        if not property_data:
            raise HTTPException(status_code=404, detail="Property not found")
        property_data["_id"] = str(property_data["_id"])
        property_data["title"] = property1_data.get("title", property_data["title"])
        property_data["description"] = property1_data.get("description", property_data["description"])
        property_data["property_type"] = property1_data.get("property_type", property_data["property_type"])
        property_data["location"] = property1_data.get("location", property_data["location"])
        property_data["price"] = property1_data.get("price", property_data["price"])
        property_data["status"] = property1_data.get("status", property_data["status"])
        property_data["listed_date"] = property1_data.get("listed_date", property_data["listed_date"])
        property_data["images"] = property1_data.get("images", property_data["images"])
        if "images" in property_data:
            property_data["images"] = [str(image_id) for image_id in property_data["images"]]
        else:
            property_data["images"] = []
        if "features" in property1_data:
            property_data["features"] = property1_data["features"]
        else:
            property_data["features"] = property_data.get("features", [])
        if "amenities" in property1_data:
            property_data["amenities"] = property1_data["amenities"]
        else:
            property_data["amenities"] = property_data.get("amenities", [])
        if "listed_date" in property1_data:
            property_data["listed_date"] = property1_data["listed_date"]
        else:
            property_data["listed_date"] = property_data.get("listed_date", datetime.now().strftime("%Y-%m-%d"))    
        return property_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/property/{property_id}/favorite")
async def add_to_favorites(property_id: str, request: Request):
    try:
        # Check authentication
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        # Get user email from token
        user_data = decode_Access_token(session)
        user_email = user_data.get("email")
        
        # Check if property exists and convert to ObjectId
        try:
            object_id = ObjectId(property_id)
            property_data = db1.get_collection('Property').find_one({"_id": object_id})
            if not property_data:
                raise HTTPException(status_code=404, detail="Property not found")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid property ID format")
            
        # Add to user's favorites
        result = db1.get_collection('User').update_one(
            {"email": user_email},
            {"$addToSet": {"favorites": str(object_id)}}  # Store as string
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Property already in favorites")
            
        return {"message": "Property added to favorites"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/property/{property_id}/favorite")
async def check_favorite_status(property_id: str, request: Request):
    try:
        # Check authentication
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        # Get user email from token
        user_data = decode_Access_token(session)
        user_email = user_data.get("email")
        
        # Get user and check if property_id is in favorites list
        user = db1.get_collection('User').find_one({"email": user_email})

        is_favorited = False
        if user and "favorites" in user and property_id in user["favorites"]:
            is_favorited = True
            
        return {"isFavorited": is_favorited}
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error checking favorite status: {e}")
        # Return a generic error response, or a specific one if needed
        raise HTTPException(status_code=500, detail="Failed to check favorite status")

@app.delete("/property/{property_id}/favorite")
async def remove_from_favorites(property_id: str, request: Request):
    try:
        # Check authentication
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        # Get user email from token
        user_data = decode_Access_token(session)
        user_email = user_data.get("email")
        
        # Remove from user's favorites
        result = db1.get_collection('User').update_one(
            {"email": user_email},
            {"$pull": {"favorites": property_id}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Property not in favorites")
            
        return {"message": "Property removed from favorites"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/property/favorites")
async def get_favorites(request: Request):
    try:
        # Check authentication
        session = request.cookies.get('session')
        print(f"Session cookie: {session}")
        if not session:
            raise HTTPException(status_code=401, detail="Not authenticated")
            
        # Get user email from token
        user_data = decode_Access_token(session)
        user_email = user_data.get("email")
        
        # Get user's favorites
        user = db1.get_collection('User').find_one({"email": user_email})
        if not user:
            return JSONResponse(status_code=200, content={"favorites": []})
            
        # Debug: Print user data
        print(f"User data: {user}")
        
        # Initialize favorites array if it doesn't exist
        if "favorites" not in user:
            db1.get_collection('User').update_one(
                {"email": user_email},
                {"$set": {"favorites": []}}
            )
            return JSONResponse(status_code=200, content={"favorites": []})
            
        # Get favorite properties
        favorite_properties = []
        for property_id in user["favorites"]:
            try:
                # Debug: Print property ID
                print(f"Processing property ID: {property_id}, type: {type(property_id)}")
                
                # Skip if property_id is not a string
                if not isinstance(property_id, str):
                    print(f"Skipping invalid property ID type: {type(property_id)}")
                    continue
                    
                # Skip if property_id is empty
                if not property_id.strip():
                    print("Skipping empty property ID")
                    continue
                
                # Convert string ID to ObjectId
                object_id = ObjectId(property_id)
                property_data = db1.get_collection('Property').find_one({"_id": object_id})
                if property_data:
                    property_data["_id"] = str(property_data["_id"])
                    favorite_properties.append(property_data)
                else:
                    print(f"Property not found for ID: {property_id}")
            except Exception as e:
                print(f"Error processing property ID {property_id}: {str(e)}")
                # Remove invalid property ID from favorites
                try:
                    db1.get_collection('User').update_one(
                        {"email": user_email},
                        {"$pull": {"favorites": property_id}}
                    )
                except Exception as update_error:
                    print(f"Error removing invalid property ID: {str(update_error)}")
                continue
                
        return JSONResponse(status_code=200, content={"favorites": favorite_properties})
    except Exception as e:
        print(f"Error getting favorites: {e}")
        return JSONResponse(status_code=200, content={"favorites": []})

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    try:
        # Check database connection
        db1.command('ping')
        return {"status": "healthy", "service": SERVICE_NAME}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
