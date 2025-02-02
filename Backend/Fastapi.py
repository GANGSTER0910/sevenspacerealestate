from datetime import datetime, timedelta
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
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import random
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi.staticfiles import StaticFiles
app = FastAPI()
load_dotenv()
origins = [
    "http://localhost:5173",
    "http://localhost:8000",
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
algorithm = os.getenv("Alogrithm")
access_token_expire_time = int(os.getenv("Access_Token_Expire_Time"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated= "auto")
SEND_GRID_API = os.getenv("SEND_GRID_API_KEY")
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
        'redirect_url': 'http://localhost:8000/auth'
    }
)

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
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt = jwt_instance.encode(to_encode, secret_key, alg=algorithm)
    print(encoded_jwt)  
    return encoded_jwt

def create_cookie(token:str):
    response = JSONResponse(content= "Thank You! Succesfully Completed ")
    response.set_cookie(key="session",value=token,httponly=True,secure=True, samesite='none',max_age=3600)
    return response

def getcookie(token:str):
    response = JSONResponse(content="Admin Login Succesfully")
    response.get

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)



@app.post('/checkAuthentication')
async def check(request: Request):
    session = request.cookies.get('session')
    print(session )
    if session:
        return JSONResponse(status_code=200, content={"message": "Authenticated"})
    else:
        return JSONResponse(status_code=307, content={"message": "Cookie Not Found"})

@app.post("/user")
async def create_user(user : User):
    try:
        user_dict = user.model_dump()
        user_dict["password"] = get_password_hash(user_dict["password"])
        expire_timedelta = timedelta(minutes=access_token_expire_time)
        user_token = create_access_token(user_dict,expire_timedelta)
        db1.get_collection('User').insert_one(user_dict)
        return create_cookie(user_token)
        # return "Succesfully"
    except:
        raise HTTPException(400)

@app.post("/user/login")
async def user_login(user: User_login):
        user_dict = db1.get_collection('User').find_one({"email":user.email}, {"_id ":0})
        if user_dict:
            if verify_password(user.password, user_dict.get("password","")):
                expire_timedelta = timedelta(minutes=access_token_expire_time)
                user_token = create_access_token(user_dict,expire_timedelta)
                return create_cookie(user_token)
            else:
                raise HTTPException(400, detail="Invalid Password")

@app.post("/generate-otp")
def send_otp_via_sendgrid(receiver_email:otp, response : Response):
    otp = str(random.randint(100000, 999999))
    message = Mail(
        from_email='harsh.panchal.0910@gmail.com',
        to_emails=receiver_email.email,
        subject='Your OTP for Registration',
        plain_text_content=f'Your OTP is: {otp}\nPlease do not share this with anyone.')

    try:
        sg = SendGridAPIClient(SEND_GRID_API)
        response = sg.send(message)
        response.set_cookie(key=f"otp_{receiver_email.email}", value=otp,httponly=True, secure=True, samesite='none', max_age=180)
        return {"message": "OTP sent successfully!", "otp": otp, "status_code": response.status_code}   
    except Exception as e:
        return {"error": str(e)}
    
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


@app.post("/property")
async def add_property(property: Property):
    # property_data = property.dict() 
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
    property_data["title"] = normalized_title
    property_data["location"] = property.location.strip()
    result = db1.get_collection('Property').insert_one(property_data)
    property_data["_id"] = str(result.inserted_id)
    return {"message": "Property added successfully", "property": jsonable_encoder(property_data)}

@app.get("/property/category")
async def get_property_by_category(category: str, status: Optional[str] = None):
    query = {"category": category}  # Adding category to the query
    
    if status:  # If status is provided, include it in the query
        query["status"] = status

    properties = list(db1.get_collection('Property').find(query, {"_id": 0}))
    return {"count": len(properties), "properties": properties}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    