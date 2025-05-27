# from fastapi import FastAPI
# from fastapi.templating import Jinja2Templates
# from starlette.requests import Request
# from starlette.responses import RedirectResponse
# from starlette.middleware.sessions import SessionMiddleware
# from authlib.integrations.starlette_client import OAuth, OAuthError
# from fastapi.staticfiles import StaticFiles
# from fastapi.middleware.cors import CORSMiddleware
# import os
# from dotenv import load_dotenv
# load_dotenv()
# app = FastAPI()
# origins = [
#     "http://localhost:5173",
#     "http://localhost:8000",
#     ]  

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins= origins,
#     allow_credentials= True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# CLIENT_ID = os.getenv('CLIENT_ID')
# CLIENT_SECRET = os.getenv('CLIENT_SECRET')
# oauth = OAuth()
# oauth.register(
#     name='google',
#     server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
#     client_id=CLIENT_ID,
#     client_secret=CLIENT_SECRET,
#     client_kwargs={
#         'scope': 'email openid profile',
#         'redirect_url': 'http://localhost:8000/auth'
#     }
# )


# templates = Jinja2Templates(directory="templates")


# @app.get("/")
# def index(request: Request):
#     user = request.session.get('user')
#     if user:
#         return RedirectResponse('welcome')

#     return templates.TemplateResponse(
#         name="home.html",
#         context={"request": request}
#     )


# @app.get('/welcome')
# def welcome(request: Request):
#     user = request.session.get('user')
#     if not user:
#         return RedirectResponse('/')
#     return templates.TemplateResponse(
#         name='welcome.html',
#         context={'request': request, 'user': user}
#     )


# @app.get("/login")
# async def login(request: Request):
#     url = request.url_for('auth')
#     return await oauth.google.authorize_redirect(request, url)


# @app.get('/auth')
# async def auth(request: Request):
#     try:
#         token = await oauth.google.authorize_access_token(request)
#     except OAuthError as e:
#         return templates.TemplateResponse(
#             name='error.html',
#             context={'request': request, 'error': e.error}
#         )
#     user = token.get('userinfo')
#     if user:
#         request.session['user'] = dict(user)
#     return RedirectResponse('welcome')


# @app.get('/logout')
# def logout(request: Request):
#     request.session.pop('user')
#     request.session.clear()
#     return RedirectResponse('/')


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
import os
from dotenv import load_dotenv
load_dotenv()
Secret_key = os.getenv("SECRET_KEY")
print(Secret_key)