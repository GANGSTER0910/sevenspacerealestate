from datetime import datetime, timedelta, timezone
from fastapi import *
from fastapi.responses import JSONResponse, RedirectResponse
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
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
import httpx
from authlib.integrations.starlette_client import OAuth, OAuthError

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
# Add after your existing imports
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
password = os.getenv('REDIS_PASSWORD')
url = os.getenv('url')
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
        secure=True,  
        samesite='none',
        max_age=3600,  
        path="/",  
        
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
oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    client_kwargs={
        'scope': 'openid email profile',
    }
)

def verify_google_id_token(token: str) -> Optional[dict]:
    """Verify Google ID token and return user info"""
    try:
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'name': idinfo['name'],
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
    except ValueError as e:
        print(f"Token verification failed: {e}")
        return None

def get_or_create_google_user(user_info: dict) -> dict:
    """Get existing Google user or create new one"""
    existing_user = db1.get_collection('User').find_one({"google_id": user_info['google_id']})
    
    if existing_user:
        db1.get_collection('User').update_one(
            {"google_id": user_info['google_id']},
            {"$set": {
                "name": user_info['name'],
                "picture": user_info['picture'],
                "email": user_info['email']
            }}
        )
        existing_user["_id"] = str(existing_user["_id"])
        return existing_user
    
    existing_email_user = db1.get_collection('User').find_one({"email": user_info['email']})
    
    if existing_email_user:
        db1.get_collection('User').update_one(
            {"email": user_info['email']},
            {"$set": {
                "google_id": user_info['google_id'],
                "name": user_info['name'],
                "picture": user_info['picture']
            }}
        )
        existing_email_user["_id"] = str(existing_email_user["_id"])
        return existing_email_user
    
    new_user = {
        "email": user_info['email'],
        "name": user_info['name'],
        "google_id": user_info['google_id'],
        "picture": user_info.get('picture', ''),
        "role": "user",  # Default role
        "password": None,  # No password for Google users
        "email_verified": user_info.get('email_verified', False)
    }
    
    result = db1.get_collection('User').insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    return new_user


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
        secure=True,  
        samesite='none',
        max_age=3600,  
        path="/",  
        
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
@app.post("/auth/google/token")
async def google_token_login(request: GoogleTokenRequest):
    """Login with Google ID token (for frontend integration)"""
    try:
        user_info = verify_google_id_token(request.credential)
        
        if not user_info:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        
        if not user_info['email_verified']:
            raise HTTPException(status_code=401, detail="Email not verified")
        
        user = get_or_create_google_user(user_info)
        expire_timedelta = timedelta(hours=1)
        access_token = create_access_token(user, expire_timedelta)
        
        response = JSONResponse(
            content={
                "message": "Google login successful",
                "user": {
                    "id": user["_id"],
                    "email": user["email"],
                    "name": user["name"],
                    "picture": user.get("picture", ""),
                    "role": user.get("role", "user")
                }
            }
        )
        response.set_cookie(
            key="session",
            value=access_token,
            httponly=True,
            secure=True,
            samesite='none',
            max_age=3600,
            path="/",
        )
        
        return response
        
    except Exception as e:
        print(f"Google login error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/auth/google/login")
async def google_login(request: Request):
    """Redirect to Google OAuth (for server-side flow)"""
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request: Request):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        
        user_info = token.get('userinfo')
        if not user_info:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {token["access_token"]}'}
                )
                user_info = response.json()
        
        formatted_user_info = {
            'google_id': user_info['sub'],
            'email': user_info['email'],
            'name': user_info['name'],
            'picture': user_info.get('picture', ''),
            'email_verified': user_info.get('email_verified', False)
        }
        
        user = get_or_create_google_user(formatted_user_info)
        
        expire_timedelta = timedelta(hours=1)
        access_token = create_access_token(user, expire_timedelta)
        
        frontend_url = os.getenv('FRONTEND_URL')  # Your frontend URL
        response = RedirectResponse(url=f"{frontend_url}/user/dashboard")
        
        response.set_cookie(
            key="session",
            value=access_token,
            httponly=True,
            secure=True,
            samesite='none',
            max_age=3600,
            path="/",
        )
        
        return response
        
    except Exception as e:
        print(f"Google callback error: {str(e)}")
        raise HTTPException(status_code=400, detail="Google authentication failed")

@app.get("/auth/google/url")
async def get_google_auth_url():
    """Get Google OAuth URL for frontend"""
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"access_type=offline"
    )
    return {"auth_url": auth_url}

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    try:
        db1.command('ping')
        return {"status": "healthy", "service": SERVICE_NAME}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
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