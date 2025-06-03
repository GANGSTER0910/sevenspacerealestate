from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import JWT, jwk_from_dict
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from typing import Dict, Set

load_dotenv()

security = HTTPBearer()
Secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("Algorithm")
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory token blacklist (consider using Redis in production)
token_blacklist: Set[str] = set()

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

def create_access_token(data: dict):
    """Create a new access token"""
    jwt_instance = JWT()
    secret_key = jwk_from_dict({
        "k": Secret_key,
        "kty": "oct"
    })
    
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    return jwt_instance.encode(to_encode, secret_key, algorithm=algorithm)

def create_refresh_token(data: dict):
    """Create a new refresh token"""
    jwt_instance = JWT()
    secret_key = jwk_from_dict({
        "k": Secret_key,
        "kty": "oct"
    })
    
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    return jwt_instance.encode(to_encode, secret_key, algorithm=algorithm)

def blacklist_token(token: str):
    """Add a token to the blacklist"""
    token_blacklist.add(token)

def is_token_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted"""
    return token in token_blacklist

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency for getting the current user from the token
    """
    token = credentials.credentials
    if is_token_blacklisted(token):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    return decode_access_token(token)

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