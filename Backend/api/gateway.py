from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from middleware import setup_middleware
from service_discovery import setup_service_discovery, service_registry

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="API Gateway",
    description="Gateway for all microservices",
    version="1.0.0"
)

# Setup middleware
setup_middleware(app)

# Setup service discovery
setup_service_discovery(app)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://sevenspacerealestate.vercel.app",
        "http://localhost:5173",
        "http://localhost:8000" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service routing
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def route_request(path: str, request: Request):
    """
    Route requests to appropriate service
    """
    # Get service name from path
    service_name = path.split("/")[0]
    print(f"Received request for service: {service_name}")
    print(f"Currently registered services: {service_registry.get_all_services()}")
    try:
        # Get service URL
        service_url = service_registry.get_service_url(service_name)
        print(f"Routing request to: {service_url}")
        
        # Construct the path to forward, removing the service name
        forward_path = "/".join(path.split("/")[1:])
        
        # Forward request to service
        async with httpx.AsyncClient() as client:
            # Get request body
            body = await request.body()
            
            # Forward request
            response = await client.request(
                method=request.method,
                url=f"{service_url}/{forward_path}",
                headers=dict(request.headers),
                params=dict(request.query_params),
                content=body
            )
# from starlette.datastructures import UploadFile as StarletteUploadFile

# @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
# async def route_request(path: str, request: Request):
#     service_name = path.split("/")[0]
#     try:
#         service_url = service_registry.get_service_url(service_name)
#         forward_path = "/".join(path.split("/")[1:])
#         async with httpx.AsyncClient() as client:
#             if request.method in ("POST", "PUT"):
#                 form = await request.form()
#                 files = []
#                 data = {}
#                 for key, value in form.multi_items():
#                     if isinstance(value, StarletteUploadFile):
#                         files.append((key, (value.filename, await value.read(), value.content_type)))
#                     else:
#                         data[key] = value
#                 response = await client.request(
#                     method=request.method,
#                     url=f"{service_url}/{forward_path}",
#                     data=data if data else None,
#                     files=files if files else None,
#                     params=dict(request.query_params),
#                     headers={k: v for k, v in dict(request.headers).items() if k.lower() not in ["content-type", "content-length", "host"]}
#                 )
#             else:
#                 response = await client.request(
#                     method=request.method,
#                     url=f"{service_url}/{forward_path}",
#                     headers=dict(request.headers),
#                     params=dict(request.query_params),
#                     content=await request.body()
#                 )
#             # ... rest of your response handling code
            print(f"Forwarded request to {service_name} at {service_url}/{forward_path}")
            # Create a new response with the service's content
            gateway_response = Response(
    content=response.content,
    status_code=response.status_code,
    media_type=response.headers.get("content-type", "application/json")
)
            print("Gateway response content:", response.content)

            
            # Forward all headers from the service response
            # After creating gateway_response
            excluded_headers = {"content-length", "transfer-encoding", "connection", "content-encoding"}
            for key, value in response.headers.items():
                if key.lower() in excluded_headers:
                    continue
                if key.lower() == "set-cookie":
                    for cookie in response.headers.get_list("set-cookie"):
                        gateway_response.headers.append("set-cookie", cookie)
                else:
                    gateway_response.headers[key] = value

            
            return gateway_response
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "service": "api-gateway"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 