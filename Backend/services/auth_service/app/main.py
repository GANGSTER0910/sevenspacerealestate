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
app = FastAPI(
    title="Auth service"
)
load_dotenv()
SERVICE_NAME = "auth_service"
SERVICE_URL = f"http://auth_service:8001"
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
    return pwd_context.verify(plain_password, hashed_password)

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

@app.put("/user/forgot-password")
async def forgot_password(user: User_forgot_password, password_reset: str):
    try:
        user = user.model_dump(exclude_unset=True)
        user_dict = db1.get_collection('User').find_one({"email": user['email']})
        if not user_dict:
            raise HTTPException(status_code=404, detail="User not found")
        new_password = get_password_hash(password_reset)
        # user_dict["password"] = new_password
        db1.get_collection('User').update_one({"email": user['email']}, {"$set": {"password":new_password}})
        
        return JSONResponse(status_code=200, content={"message": "Password updated successfully"})
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/user/{user_id}")
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
@app.put("/user/{user_id}")
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
async def verify_otp(otp : otp_verify, otp_cookie : str=Cookie(None)):
    if not otp_cookie:
        raise HTTPException(status_code=400, detail="Otp not found")
    elif otp!=otp_cookie:
        raise HTTPException(status_code=400, detail="Otp is invalid")
    return {"message": "OTP verified successfully"}


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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)