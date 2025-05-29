from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import JWT, jwk_from_dict
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()
Secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("Algorithm")

def decode_access_token(token: str):
    try:
        jwt_instance = JWT()
        secret_key = jwk_from_dict({
            "k": Secret_key,
            "kty": "oct"
        })
        
        current_time = datetime.now(timezone.utc)
        payload = jwt_instance.decode(token, secret_key, algorithms=[algorithm])
        
        # Check expiration
        exp = payload.get('exp')
        if exp:
            exp_time = datetime.fromtimestamp(exp, timezone.utc)
            if current_time > exp_time:
                raise HTTPException(status_code=401, detail="Token has expired")
        
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if email is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token data")
            
        return {
            "email": email,
            "role": role
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency for getting the current user from the token
    """
    return decode_access_token(credentials.credentials)

def require_role(required_role: str):
    """
    Dependency for checking if user has required role
    """
    async def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] != required_role:
            raise HTTPException(
                status_code=403,
                detail=f"Operation requires {required_role} role"
            )
        return user
    return role_checker 