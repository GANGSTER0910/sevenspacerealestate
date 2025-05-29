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
fs = gridfs.GridFS(db1)

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
    uvicorn.run(app, host="0.0.0.0", port=8005)
    