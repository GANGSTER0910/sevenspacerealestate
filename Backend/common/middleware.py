from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import time
import logging
import json
from typing import Callable
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start timer
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url}")
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {request.method} {request.url} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.2f}s"
            )
            
            return response
            
        except Exception as e:
            # Log error
            logger.error(f"Error processing request: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as e:
            # Log the error
            logger.error(f"Error: {str(e)}")
            
            # Return appropriate error response
            if isinstance(e, ValueError):
                return JSONResponse(
                    status_code=400,
                    content={"detail": str(e)}
                )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, rate_limit: int = 100, time_window: int = 60):
        super().__init__(app)
        self.rate_limit = rate_limit
        self.time_window = time_window
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host
        
        # Get current time
        current_time = time.time()
        
        # Clean old requests
        self.requests = {
            ip: timestamps for ip, timestamps in self.requests.items()
            if current_time - timestamps[-1] < self.time_window
        }
        
        # Check rate limit
        if client_ip in self.requests:
            timestamps = self.requests[client_ip]
            if len(timestamps) >= self.rate_limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests"}
                )
            timestamps.append(current_time)
        else:
            self.requests[client_ip] = [current_time]
        
        return await call_next(request)

def setup_middleware(app):
    """
    Setup all middleware for the application
    """
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(RateLimitMiddleware) 