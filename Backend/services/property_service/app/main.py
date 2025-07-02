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
SERVICE_URL = os.getenv('PROPERTY_SERVICE_URL')

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://sevenspacerealestate.vercel.app",
    "https://sevenspacerealestate.onrender.com",
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
algorithm = os.getenv("Algorithm")
link = os.getenv("Database_Link")
client1 = MongoClient(link)
db1 = client1['SSRealEstate']
url = os.getenv('url')
fs = gridfs.GridFS(db1)

def create_index():
    collection = db1.get_collection('Property')
    collection.create_index([("title", 1), ("location", 1)], name="title_location_index")
    collection.create_index([("owner_email", 1)], name="owner_email_index")
    collection.create_index([("listed_date", -1)], name="listed_date_index")
    collection.create_index([("status", 1)], name="status_index")
    collection.create_index([("property_type", 1)], name="property_type_index")
    collection.create_index([("price", 1)], name="price_index")
    collection.create_index([("location", 1), ("price", 1)], name="location_price_index")
    collection.create_index([("bedrooms", 1)], name="bedrooms_index")
    collection.create_index([("bathrooms", 1)], name="bathrooms_index")
    collection.create_index([("bedrooms", 1), ("price", 1)], name="bedrooms_price_index")
    collection.create_index([("location", 1), ("area_sqft", 1)], name="location_area_index")
    collection.create_index([("status", 1), ("listed_date", -1)], name="available_recent_index")
    collection.create_index([("amenities", 1)], name="amenities_index")

    collection.create_index([
        ("title", "text"),
        ("description", "text"),
        ("location", "text")
    ], name="combined_text_index")

    print("Indexes created successfully.")

def drop_all_indexes_on_shutdown():
    collection = db1.get_collection('Property')
    for index in collection.index_information():
        if index != "_id_":
            collection.drop_index(index)
    print("All indexes (except _id_) dropped successfully.")

app.add_middleware(SessionMiddleware, secret_key=Secret_key)

@app.on_event("startup")
async def startup_event():
    """Register service on startup"""
    try:
        create_index()
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
        drop_all_indexes_on_shutdown()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}/unregister",
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
def decode_Access_token(token: str):
    try:
        jwt_instance = JWT()
        secret_key = jwk_from_dict({
            "k": Secret_key,
            "kty": "oct"
        })
        
        current_time = datetime.now(timezone.utc)    
        payload = jwt_instance.decode(token, secret_key, algorithms=[algorithm])
        
        exp = payload.get('exp')
        if exp:
            exp_time = datetime.fromtimestamp(exp, timezone.utc)
            if current_time > exp_time:
                raise HTTPException(status_code=401, detail="Token has expired")
        
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if email is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token data")
            
        token_data = {
            "email": email,
            "role": role
        }
        return token_data
        
    except JWTDecodeError as e:
        print(f"JWT decode error: {str(e)}")
        if "expired" in str(e).lower():
            raise HTTPException(status_code=401, detail="Token has expired")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        print(f"Unexpected error in decode_Access_token: {str(e)}")
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/property")
async def add_property(property: Property, request: Request):
    try:
        property_data = property.dict()
        validate_property_data(property_data)

        # Determine the owner from the session cookie (if present)
        session = request.cookies.get('session')
        if session:
            try:
                user_data = decode_Access_token(session)
                property_data["owner_email"] = user_data.get("email")
            except Exception as e:
                # Token invalid or expired – ignore owner attachment but log
                print(f"Warning: could not decode token in add_property: {e}")

        normalized_title = property.title.strip().lower()
        normalized_location = property.location.strip().lower()

        existing_property = db1.get_collection('Property').find_one(
            {"title": normalized_title, "location": normalized_location},
            {"_id": 0}
        )
        if existing_property:
            raise HTTPException(status_code=400, detail="Property already exists")

        property_data["title"] = normalized_title
        property_data["location"] = normalized_location
        if not property_data.get("listed_date"):
            property_data["listed_date"] = datetime.now().strftime("%Y-%m-%d")

        result = db1.get_collection('Property').insert_one(property_data)
        property_data["_id"] = str(result.inserted_id)

        return {"message": "Property added successfully", "property": jsonable_encoder(property_data)}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add property: {str(e)}")

@app.get("/property/search")
async def search_properties(q: str = Query(..., description="Search query")):
    try:
        collection = db1.get_collection('Property')

        # Text search with score
        cursor = collection.find(
            {"$text": {"$search": q}, "status": "available"},
            {"score": {"$meta": "textScore"}}  # ✅ Projection goes here
        ).sort([("score", {"$meta": "textScore"})])  # ✅ Sort by score

        properties = []
        for prop in cursor:
            prop["_id"] = str(prop["_id"])
            properties.append(prop)

        return {"count": len(properties), "properties": properties}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/property/{property_id}")
async def delete_property(property_id: str):
    try:
        existing_property = db1.get_collection('Property').find_one({"_id": ObjectId(property_id)})
        if not existing_property:
            raise HTTPException(status_code=404, detail="Property not found")

        db1.get_collection('Property').delete_one({"_id": ObjectId(property_id)})

        return {"message": "Property deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete property: {str(e)}")

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

@app.put("/property/edit/{property_id}")
async def edit_property(property_id: str, property: Property):
    try:
        existing = db1.get_collection('Property').find_one({"_id": ObjectId(property_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Property not found")

        property1_data = property.dict()
        
        updated_data = {
            "title": property1_data.get("title", existing["title"]).strip().lower(),
            "description": property1_data.get("description", existing.get("description", "")),
            "property_type": property1_data.get("property_type", existing.get("property_type", "")),
            "location": property1_data.get("location", existing["location"]).strip(),
            "price": property1_data.get("price", existing.get("price", 0)),
            "status": property1_data.get("status", existing.get("status", "available")),
            "listed_date": property1_data.get("listed_date", existing.get("listed_date", datetime.now().strftime("%Y-%m-%d"))),
            "images": [str(i) for i in property1_data.get("images", existing.get("images", []))],
            "features": property1_data.get("features", existing.get("features", [])),
            "amenities": property1_data.get("amenities", existing.get("amenities", []))
        }

        db1.get_collection('Property').update_one(
            {"_id": ObjectId(property_id)},
            {"$set": updated_data}
        )

        updated_data["_id"] = property_id
        return {"message": "Property updated successfully", "property": jsonable_encoder(updated_data)}

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
        if user and isinstance(user.get("favorites", []), list) and property_id in user.get("favorites", []):
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
        print(session)
        if not session:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Decode user email from token
        user_data = decode_Access_token(session)
        print(user_data)
        user_email = user_data.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Find user
        user = db1.get_collection('User').find_one({"email": user_email})
        if not user or "favorites" not in user:
            return {"favorites": []}

        # Fetch all properties from favorites
        favorite_properties = []
        for prop_id_str in user["favorites"]:
            try:
                object_id = ObjectId(prop_id_str)
                prop = db1.get_collection("Property").find_one({"_id": object_id})
                if prop:
                    prop["_id"] = str(prop["_id"])  # Convert ObjectId to str
                    favorite_properties.append(prop)
            except Exception as e:
                print(f"Skipping invalid property_id: {prop_id_str}, error: {e}")
                continue

        return {"favorites": favorite_properties}
    except Exception as e:
        print(f"Error in get_favorites: {e}")
        return {"favorites": []}

@app.get("/property/my")
async def get_my_properties(request: Request):
    try:
        # Authenticate user via session cookie
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="Not authenticated")

        user_data = decode_Access_token(session)
        user_email = user_data.get("email")
        if not user_email:
            raise HTTPException(status_code=400, detail="Invalid token")

        # Fetch properties by owner_email
        cursor = db1.get_collection('Property').find({"owner_email": user_email})
        my_properties = []
        for prop in cursor:
            prop["_id"] = str(prop["_id"])
            my_properties.append(prop)

        return {"count": len(my_properties), "properties": jsonable_encoder(my_properties)}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
