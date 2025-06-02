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
from typing import Optional
from bson import ObjectId
from schema import *
import gridfs
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError
from jwt.exceptions import JWTDecodeError
app = FastAPI()
load_dotenv()
origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://sevenspacerealestate.vercel.app",
    "http://localhost:3000",
    ]  

Secret_key = os.getenv("SECRET_KEY")
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"],
)
link = os.getenv("DataBase_Link")
client1 = MongoClient(link)
db1 = client1['SSRealEstate']
app.add_middleware(SessionMiddleware,
    secret_key = Secret_key,)

@app.post("/property")
async def add_property(property: Property, files: List[UploadFile] = File(...)):
    # property_data = property.dict() 
    image_ids = []
    for file in files:
        image_id = fs.put(file.file, filename=file.filename)
        image_ids.append(str(image_id))
    normalized_title = property.title.strip().lower()
    if not property.listed_date:
        property.listed_date = datetime.now().strftime("%Y-%m-%d")
    existing_property = db1.get_collection('Property').find_one(
        {"title": normalized_title, "location": property.location.strip()},
        {"_id": 0}
    )
    if existing_property:
        raise HTTPException(status_code=400, detail="Property already exists.")
    property_data = property.dict()
    property_data["images"] = image_ids
    property_data["title"] = normalized_title
    property_data["location"] = property.location.strip()
    result = db1.get_collection('Property').insert_one(property_data)
    property_data["_id"] = str(result.inserted_id)
    return {"message": "Property added successfully", "property": jsonable_encoder(property_data)}

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
    
    # Debugging: Check the actual query
        # print(f"Querying database with: {query}")
    
        properties = list(db1.get_collection("Property").find({"status": status}))
        # print(properties)
        for property in properties:
            property["_id"] = str(property["_id"])
    # Debugging: Check the retrieved data
        if not properties:
            print("No properties found matching the criteria.")
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
