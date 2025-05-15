

import os
import dotenv
from sib_api_v3_sdk import Configuration, ApiClient
from sib_api_v3_sdk.api.transactional_emails_api import TransactionalEmailsApi
from sib_api_v3_sdk.models.send_smtp_email import SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException
dotenv.load_dotenv()
# Step 1: Set up API configuration
configuration = Configuration()
configuration.api_key['api-key'] = os.getenv('Brevo_key')
# Step 2: Compose your email
email = SendSmtpEmail(
    to=[{"email": "harsh.panchal.0910@gmail.com", "name": "Harsh"}],
    sender={"email": "harsh.p4@ahduni.edu.in", "name": "Sevenspace"},
    subject="Hello from Brevo (Direct Email)",
    html_content="""
        <html>
            <body>
                <h1>Hello!</h1>
                <p>This is a one-to-one email sent using the Brevo Transactional API.</p>
            </body>
        </html>
    """
)

# Step 3: Send the email
api_client = ApiClient(configuration)
api_instance = TransactionalEmailsApi(api_client)

try:
    response = api_instance.send_transac_email(email)
    print("✅ Email sent successfully!")
except ApiException as e:
    print(f"❌ Failed to send email: {e}")
