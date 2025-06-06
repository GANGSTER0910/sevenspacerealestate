from fastapi import FastAPI, HTTPException, Request
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
        "http://localhost:3000", # Add your frontend origin
        "https://sevenspacerealestate.vercel.app", # Add your Vercel deployment URL if applicable
        "http://localhost:5173", # Add other potential frontend origins if applicable
        "http://localhost:8000" # Add the API Gateway itself
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
            
            return response.json()
            
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