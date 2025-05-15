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
import gridfs
import random
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi.staticfiles import StaticFiles
from sib_api_v3_sdk import Configuration, ApiClient
from sib_api_v3_sdk.api.transactional_emails_api import TransactionalEmailsApi
from sib_api_v3_sdk.models.send_smtp_email import SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException
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
algorithm = os.getenv("Alogrithm")
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
async def create_user(user: User):
    try:
        # Check if user already exists
        existing_user = db1.get_collection('User').find_one({"email": user.email})
        if existing_user:
            raise HTTPException(400, detail="Email already registered")

        user_dict = user.model_dump()
        user_dict["password"] = get_password_hash(user_dict["password"])
        result = db1.get_collection('User').insert_one(user_dict)
        
        # Convert ObjectId to string
        user_dict["_id"] = str(result.inserted_id)
        
        expire_timedelta = timedelta(minutes=access_token_expire_time)
        user_token = create_access_token(user_dict, expire_timedelta)
        return create_cookie(user_token)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(400, detail=str(e))

@app.post("/user/login")
async def user_login(user: User_login):
    try:
        user_dict = db1.get_collection('User').find_one({"email": user.email})
        if user_dict:
            if verify_password(user.password, user_dict.get("password", "")):
                # Convert ObjectId to string before creating token
                user_dict["_id"] = str(user_dict["_id"])
                expire_timedelta = timedelta(minutes=access_token_expire_time)
                user_token = create_access_token(user_dict, expire_timedelta)
                return create_cookie(user_token)
            else:
                raise HTTPException(400, detail="Invalid Password")
        else:
            raise HTTPException(400, detail="User not found")
    except Exception as e:
        raise HTTPException(400, detail=str(e))

    
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
        print(f"Querying database with: {query}")
    
        properties = list(db1.get_collection("Property").find({"status": status}))
        print(properties)
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

@app.post("/contact")
async def submit_contact_form(contact: Contact):
    try:
        # Store contact form data in database
        contact_data = contact.dict()
        db1.get_collection('Contact').insert_one(contact_data)
        to_email = contact_data["email"]
        to_name = contact_data["name"]
        # Send email using SendGrid
        configuration = Configuration()
        configuration.api_key['api-key'] = os.getenv('Brevo_key')
# Step 2: Compose your email
        email = SendSmtpEmail(
    to=[{"email": f"{to_email}", "name": f"{to_name}"}],
    sender={"email": "harsh.p4@ahduni.edu.in", "name": "Sevenspace"},
    subject="Welcome to Seven Space Real Estate",
    html_content="""
        <html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <table width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <tr>
        <td style="background-color: #0055a5; padding: 20px; text-align: center;">
          <img src="https://i.imgur.com/1ZfH5EN.png" alt="Seven Space Real Estate" width="120" />
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #0055a5; margin-top: 0;">Thank You for Reaching Out!</h2>
          <p style="font-size: 16px; color: #333;">
            Dear Customer,
          </p>
          <p style="font-size: 16px; color: #333;">
            We appreciate your interest in <strong>Seven Space Real Estate</strong> – your ideal property solution. Our team will get back to you shortly with tailored property options that best match your requirements.
          </p>
          <p style="font-size: 16px; color: #333;">
            In the meantime, if you have any urgent questions or would like to speak to us directly, please feel free to contact:
          </p>
          <ul style="list-style: none; padding-left: 0; font-size: 16px; color: #333;">
            <li><strong>Pravin Sachaniya</strong>, Real Estate Agent</li>
            <li>📞 +91 99251 11624</li>
            <li>📧 pravin.sachaniya@gmail.com</li>
            <li>📍 B – 435, SOBO Center, South Bopal, Ahmedabad – 380058</li>
          </ul>
          <p style="font-size: 16px; color: #333;">
            Thank you again for choosing Seven Space. We look forward to helping you find your perfect property!
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #666;">
          © Seven Space Real Estate – Ahmedabad Realtors Association | NAR India | World Properties
        </td>
      </tr>
    </table>
  </body>
</html>"""
)

# Step 3: Send the email
        api_client = ApiClient(configuration)
        api_instance = TransactionalEmailsApi(api_client)

        try:
            response = api_instance.send_transac_email(email)
            print("Email sent successfully!")
        except ApiException as e:
            print(f"Failed to send email: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/contact/messages")
async def get_contact_messages():
    try:
        messages = list(db1.get_collection('Contact').find({}, {"_id": 0}))
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    

# @app.get("/property/{property_id}")
# async def get_property(property_id: str):
#     try:
#         property_data = db1.get_collection('Property').find_one({"_id": ObjectId(property_id)})
#         if not property_data:
#             raise HTTPException(status_code=404, detail="Property not found")
#         property_data["_id"] = str(property_data["_id"])  # Convert ObjectId to string
#         return property_data
#     except:
#         raise HTTPException(status_code=400, detail="Invalid Property ID")

# @app.get("/property/all")
# async def get_all_properties(status: str = "available"):
#     query["status"] = status if status else {}  # Filter by status if provided
#     properties = list(db1.get_collection("Property").find(query, {"_id": 0}))
#     return {"count": len(properties), "properties": properties}
