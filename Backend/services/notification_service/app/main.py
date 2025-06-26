from fastapi import *
from pymongo import *
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from schema import *
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError
from sib_api_v3_sdk import Configuration, ApiClient
from sib_api_v3_sdk.api.transactional_emails_api import TransactionalEmailsApi
from sib_api_v3_sdk.models.send_smtp_email import SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException
import httpx
import re
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Notification Service",
    description="Microservice for handling notifications and emails",
    version="1.0.0"
)
load_dotenv()
url = os.getenv('url')
# Service registration
SERVICE_NAME = "notification_service"
SERVICE_URL = os.getenv('NOTIFICATION_SERVICE_URL')

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

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

link = os.getenv("Database_Link")
client1 = MongoClient(link)
db1 = client1['SSRealEstate']
BREVO_KEY = os.getenv("Brevo_key")
app.add_middleware(SessionMiddleware, secret_key=Secret_key)

async def register_with_gateway():
    """Register service with API Gateway"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}/register",
                params={"service_name": SERVICE_NAME, "service_url": SERVICE_URL}
            )
            response.raise_for_status()
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Register service on startup"""
    logger.info("Startup event triggered")
    await register_with_gateway()

@app.on_event("shutdown")
async def shutdown_event():
    """Unregister service on shutdown"""
    try:
        logger.info("Shutdown event triggered")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{url}/unregister",
                params={"service_name": SERVICE_NAME}
            )
            if response.status_code == 200:
                logger.info(f"Service {SERVICE_NAME} unregistered successfully")
    except Exception as e:
        logger.error(f"Failed to unregister service: {str(e)}")

def validate_email(email: str) -> bool:
    """Validate email format"""
    return bool(EMAIL_REGEX.match(email))

@app.post("/contact")
async def submit_contact_form(contact: Contact):
    try:
        logger.info(f"Received contact form submission: {contact.dict()}")
        
        # Validate email
        if not validate_email(contact.email):
            logger.error(f"Invalid email format: {contact.email}")
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Store contact form data in database
        try:
            contact_data = contact.dict()
            logger.info("Attempting to store contact data in database...")
            # Verify database connection before inserting
            client1.admin.command('ping')
            result = db1.get_collection('Contact').insert_one(contact_data)
            if not result.inserted_id:
                raise Exception("Failed to insert document - no ID returned")
            logger.info(f"Contact data stored successfully with ID: {result.inserted_id}")
        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            # Try to get more details about the error
            if hasattr(db_error, 'details'):
                logger.error(f"Error details: {db_error.details}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(db_error)}"
            )
        
        # Send email using Brevo
        try:
            logger.info("Initializing Brevo email configuration...")
            configuration = Configuration()
            configuration.api_key['api-key'] = BREVO_KEY

            email = SendSmtpEmail(
                to=[{"email": contact.email, "name": contact.name}],
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
                                            Dear {name},
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
                    </html>
                """.format(name=contact.name)
            )

            api_client = ApiClient(configuration)
            api_instance = TransactionalEmailsApi(api_client)

            response = api_instance.send_transac_email(email)
            return {"message": "Contact form submitted and email sent successfully"}
        except ApiException as e:
            logger.error(f"Brevo API error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while sending email: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    except HTTPException as e:
        logger.error(f"HTTP Exception: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in contact form submission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
@app.post("/otp")
async def send_otp(contact: OtpRequest):
    configuration = Configuration()
    configuration.api_key['api-key'] = BREVO_KEY
    email = SendSmtpEmail(
    to=[{"email": contact.email, "name": contact.name}],
    sender={"email": "harsh.p4@ahduni.edu.in", "name": "Sevenspace"},
    subject="Your OTP for Password Reset – Sevenspace",
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
                            <h2 style="color: #0055a5; margin-top: 0;">OTP Verification</h2>
                            <p style="font-size: 16px; color: #333;">
                                Hello {name},
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                We received a request to reset your password. Please use the following OTP to complete the verification:
                            </p>
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 20px; background-color: #f0f4f8; border-radius: 8px; margin: 20px 0; color: #0055a5;">
                                {otp}
                            </div>
                            <p style="font-size: 16px; color: #333;">
                                This OTP is valid for the next 10 minutes. Do not share it with anyone.
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                If you didn’t request this, you can safely ignore this email.
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
        </html>
    """.format(name=contact.name, otp=otp)
)
    api_client = ApiClient(configuration)
    api_instance = TransactionalEmailsApi(api_client)

    response = api_instance.send_transac_email(email)
    return {"message": "Contact form submitted and email sent successfully"}

@app.get("/contact/messages")
async def get_contact_messages():
    try:
        messages = list(db1.get_collection('Contact').find({}, {"_id": 0}))
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve messages: {str(e)}")

@app.delete("/contact/messages/{email}")
async def delete_contact_message(email: str):
    try:
        if not validate_email(email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        result = db1.get_collection('Contact').delete_one({"email": email})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        
        return {"message": "Contact message deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete message: {str(e)}")

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
    uvicorn.run(app, host="0.0.0.0", port=8004)
    