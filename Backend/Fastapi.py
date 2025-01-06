from datetime import datetime, timedelta
from fastapi import *
from fastapi.responses import JSONResponse
from pymongo import *
import os
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from jwt import JWT, jwk_from_dict
from typing import Optional
from schema import *
app = FastAPI()

origins = [
    "http://localhost:5173",
    ]  
app.add_middleware(
    CORSMiddleware,
    allow_origins= origins,
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"],
)
link = os.getenv("DataBase_Link")
client1 = MongoClient(link)
db1 = client1['LSPD']
Secret_key = os.getenv("SECRET_KEY")
algorithm = os.getenv("Alogrithm")
# access_token_expire_time = int(os.getenv("Access_Token_Expire_Time"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated= "auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta]=None):
    to_encode = data.copy()
    jwt_instance = JWT()
    secret_key = jwk_from_dict({
        "k":Secret_key,
        "kty":"oct"
    })
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp":expire.isoformat()})
    encoded_jwt = jwt_instance.encode(to_encode, secret_key,alg= algorithm)
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
        # expire_timedelta = timedelta(minutes=access_token_expire_time)
        # user_token = create_access_token(user_dict,expire_timedelta)
        db1.get_collection('User').insert_one(user_dict)
        # return create_cookie(user_token)
        return "Succesfully"
    except:
        raise HTTPException(400)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    