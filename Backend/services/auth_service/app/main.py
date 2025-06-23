from datetime import datetime, timedelta, timezone
from fastapi import *
from fastapi.responses import JSONResponse
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
import httpx
import redis
import random
app = FastAPI(
    title="Auth service"
)
load_dotenv()
SERVICE_NAME = "auth_service"
SERVICE_URL = os.getenv("AUTH_SERVICE_URL")
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
    allow_origins= origins,
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"],
)
link = os.getenv("Database_Link")
client1 = MongoClient(link)
db1 = client1['SSRealEstate']
algorithm = os.getenv("Algorithm")
access_token_expire_time = int(os.getenv("Access_Token_Expire_Time"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated= "auto")
BREVO_KEY = os.getenv("Brevo_key")
app.add_middleware(SessionMiddleware,
    secret_key = Secret_key,)
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
password = os.getenv('REDIS_PASSWORD')
url = os.getenv('url')
oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    client_kwargs={
        'scope': 'email openid profile',
        'redirect_url': 'https://sevenspacerealestate.onrender.com/auth'
    }
)
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

fs = gridfs.GridFS(db1)
def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    for key, value in to_encode.items():
        if isinstance(value, ObjectId):
            to_encode[key] = str(value)
    
    jwt_instance = JWT()
    secret_key = jwk_from_dict({
        "k": Secret_key,
        "kty": "oct"
    })
    
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=1)
    
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp())
    })
    encoded_jwt = jwt_instance.encode(to_encode, secret_key, alg=algorithm)
    return encoded_jwt
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

def create_cookie(token: str):
    response = JSONResponse(content="Thank You! Succesfully Completed ")
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,  
        samesite='lax',
        max_age=3600,  
        path="/",  
        domain=None
    )
    return response

def getcookie(token:str):
    response = JSONResponse(content="Admin Login Succesfully")
    response.get_cookie("session")

def verify_password(plain_password, hashed_password):
    # pwd_context.
    return pwd_context.verify(plain_password, hashed_password)

r = redis.Redis(
    host='redis-18614.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
    port=18614,
    decode_responses=True,
    username="default",
    password=password,
)

@app.post('/decode')
async def decode(request: Request):
    try:
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="No session token found")
        
        decoded_data = decode_Access_token(session)
        return JSONResponse(
            status_code=200,
            content=decoded_data
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post('/checkAuthentication')
async def check(request: Request):
    session = request.cookies.get('session')
    if session:
        return JSONResponse(status_code=200, content={"message": "Authenticated"})
    return JSONResponse(status_code=401, content={"message": "Not Authenticated"})

@app.post("/request-password-reset")
async def request_password_reset(email: str):
    user = db1.get_collection('User').find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    otp = random.randint(100000, 999999) 
    # r.setex(f"otp:{email}", 600, otp)  
    result = r.setex(f"otp:{email}", 600, otp)
    # print("Redis set result:", result)

    # print(f"[Email] OTP for {email}: {otp}")
    
    return JSONResponse(status_code=200, content={"otp":otp, "message": "OTP sent successfully"})

@app.post("/user")
async def create_user(user: User):
    try:
        existing_user = db1.get_collection('User').find_one({"email": user.email})
        if existing_user:
            raise HTTPException(400, detail="Email already registered")
        user_dict = user.model_dump()
        user_dict["password"] = get_password_hash(user_dict["password"])
        result = db1.get_collection('User').insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)        
        expire_timedelta = timedelta(minutes=access_token_expire_time)
        user_token = create_access_token(user_dict, expire_timedelta)
        return create_cookie(user_token)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(400, detail=str(e))

@app.put("/user/password-reset")
async def forgot_password(data: User_forgot_password):
    try:
        user_record = db1.get_collection('User').find_one({"email": data.email})
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")

        hashed_password = get_password_hash(data.password)
        result = db1.get_collection('User').update_one(
            {"email": data.email},
            {"$set": {"password": hashed_password}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return JSONResponse(status_code=200, content={"message": "Password updated successfully"})
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/user/change-password")
async def change_password(data: User_change_password, request: Request):
    try:
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="No session token found")
        
        token_data = decode_Access_token(session)
        user_email = token_data.get("email")
        
        user_record = db1.get_collection('User').find_one({"email": user_email})
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(data.old_password, user_record.get("password", "")):
            raise HTTPException(status_code=400, detail="Old password is incorrect")

        new_hashed_password = get_password_hash(data.new_password)
        result = db1.get_collection('User').update_one(
            {"email": user_email},
            {"$set": {"password": new_hashed_password}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return JSONResponse(status_code=200, content={"message": "Password changed successfully"})
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.delete("/user/id/{user_id}")
async def delete_user(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        result = db1.get_collection('User').delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return JSONResponse(status_code=200, content={"message": "User deleted successfully"})
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.put("/user/id/{user_id}")
async def update_user(user_id: str, user: User):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        user_dict = user.model_dump(exclude_unset=True)
        if "password" in user_dict:
            user_dict["password"] = get_password_hash(user_dict["password"])
        
        result = db1.get_collection('User').update_one({"_id": ObjectId(user_id)}, {"$set": user_dict})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = db1.get_collection('User').find_one({"_id": ObjectId(user_id)})
        updated_user["_id"] = str(updated_user["_id"])
        return JSONResponse(status_code=200, content=updated_user)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
@app.post("/user/login")
async def user_login(user: User_login):
    try:
        print("Login attempt received:", {"email": user.email, "password": "***"})  # Log the incoming request
        user_dict = db1.get_collection('User').find_one({"email": user.email})
        if user_dict:
            if verify_password(user.password, user_dict.get("password", "")):
                user_dict["_id"] = str(user_dict["_id"])
                expire_timedelta = timedelta(hours=1)
                user_token = create_access_token(user_dict, expire_timedelta)
                
                # Create response with proper headers
                response = JSONResponse(
                    content={
                    "message": "Login successful",
                    "role": user_dict.get("role", "user")
                    }
                )

                # Set cookie with proper attributes for local development
                response.set_cookie(
                    key="session",
                    value=user_token,
                    httponly=True,
                    secure=False,  # Set to False for local development (http)
                    samesite='lax',  # Use 'lax' for local development
                    max_age=3600,
                    path="/"
                )

                print("Login successful for user:", user.email)  # Log successful login
                return response
            else:
                print("Invalid password for user:", user.email)  # Log invalid password
                raise HTTPException(400, detail="Invalid Password")
        else:
            print("User not found:", user.email)  # Log user not found
            raise HTTPException(400, detail="User not found")
    except Exception as e:
        print("Login error:", str(e))  # Log any other errors
        raise HTTPException(400, detail=str(e))

@app.post("/user/logout")
async def user_logout(request: Request):
    try:
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="No session token found")
        
        response = JSONResponse(content={"message": "Logout successful"})
        response.delete_cookie("session")
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/user/all")
async def get_all_users():
    try:
        users = db1.get_collection('User').find()
        user_list = []
        for user in users:
            user["_id"] = str(user["_id"])
            user_list.append(user)
        return {"users": user_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/verifyotp")
async def verify_otp(email: str, otp: int):
    stored_otp = r.get(f"otp:{email}")
    # print(otp, stored_otp)
    if not stored_otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check if stored_otp is bytes and decode
    try:
        stored_otp_int = int(stored_otp.decode()) if isinstance(stored_otp, bytes) else int(stored_otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OTP retrieval error: {str(e)}")

    if stored_otp_int != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    r.delete(f"otp:{email}")
    return JSONResponse(status_code=200, content={"message": "OTP verified successfully"})

@app.get('/google/login')
async def google_login(request: Request):
    redirect_uri = request.url_for('google_auth')  
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/google/auth')
async def google_auth(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')

        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to retrieve user info")

        user = db1.get_collection('User').find_one({"email": user_info['email']})
        if not user:
            new_user = {
                "email": user_info['email'],
                "name": user_info['name'],
                "picture": user_info['picture'],
                "created_at": datetime.utcnow()
            }
            db1.get_collection('User').insert_one(new_user)

        token_data = {"email": user_info['email']}
        access_token = create_access_token(data=token_data)

        response = create_cookie(access_token)
        response.content = "Google authentication successful. Welcome!"
        return response

    except OAuthError as error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error.error}")
@app.put("/user/update")
async def update_profile(data: UpdateUser, request: Request):
    """Update currently authenticated user's profile with partial fields."""
    try:
        # Verify session token
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="No session token found")

        token_data = decode_Access_token(session)
        user_email = token_data.get("email")

        update_fields = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
        if not update_fields:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        # Do not allow email update to conflicting value
        if "email" in update_fields and update_fields["email"] != user_email:
            # Check duplicate email
            if db1.get_collection('User').find_one({"email": update_fields["email"]}):
                raise HTTPException(status_code=400, detail="Email already in use")

        # Hash password if provided in update
        if "password" in update_fields and update_fields["password"] is not None:
            update_fields["password"] = get_password_hash(update_fields["password"])

        result = db1.get_collection('User').update_one(
            {"email": user_email},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        updated_user = db1.get_collection('User').find_one({"email": update_fields.get("email", user_email)})
        updated_user["_id"] = str(updated_user["_id"])

        return JSONResponse(status_code=200, content={"message": "Profile updated successfully", "user": updated_user})
    except HTTPException as he:
        raise he
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
        logger.error(f"Health check failed: {str(e)}")
        # Return 200 even if database check fails, as the service itself is running
        return {"status": "healthy", "service": SERVICE_NAME, "database": "unavailable"}

@app.get("/user/me")
async def get_my_profile(request: Request):
    """Return details of the currently authenticated user (from session)."""
    try:
        session = request.cookies.get('session')
        if not session:
            raise HTTPException(status_code=401, detail="No session token found")

        token_data = decode_Access_token(session)
        user_email = token_data.get("email")

        user_record = db1.get_collection('User').find_one({"email": user_email})
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")

        # Exclude sensitive fields
        user_record.pop("password", None)
        user_record["_id"] = str(user_record["_id"])

        return JSONResponse(status_code=200, content={"user": user_record})
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)