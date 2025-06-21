from fastapi import FastAPI, HTTPException
import httpx
import json
import os
from typing import Dict, List
import logging
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class ServiceRegistry:
    def __init__(self):
        self.services: Dict[str, Dict] = {}
        self.health_check_interval = 30  # seconds
        self.last_health_check = {}
        self.cleanup_interval = 300  # 5 minutes
    
    def register_service(self, service_name: str, service_url: str):
        """Register a new service"""
        self.services[service_name] = {
            "url": service_url,
            "status": "healthy",
            "last_seen": datetime.now(),
            "endpoints": []
        }
        logger.info(f"Service registered: {service_name} at {service_url}")
    
    def unregister_service(self, service_name: str):
        """Unregister a service"""
        if service_name in self.services:
            del self.services[service_name]
            logger.info(f"Service unregistered: {service_name}")
    
    def update_service_status(self, service_name: str, status: str):
        """Update service status"""
        if service_name in self.services:
            self.services[service_name]["status"] = status
            self.services[service_name]["last_seen"] = datetime.now()
            logger.info(f"Service status updated: {service_name} - {status}")
    
    def get_service_url(self, service_name: str) -> str:
        """Get service URL"""
        if service_name not in self.services:
            raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
        return self.services[service_name]["url"]
    
    def get_all_services(self) -> Dict:
        """Get all registered services"""
        return self.services
    
    async def check_service_health(self, service_name: str):
        """Check service health"""
        if service_name not in self.services:
            return False
        
        service = self.services[service_name]
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{service['url']}/health")
                if response.status_code == 200:
                    self.update_service_status(service_name, "healthy")
                    return True
                else:
                    self.update_service_status(service_name, "unhealthy")
                    return False
        except Exception as e:
            logger.error(f"Health check failed for {service_name}: {str(e)}")
            self.update_service_status(service_name, "unhealthy")
            return False

    async def start_periodic_health_checks(self):
        """Start periodic health checks for all services"""
        while True:
            for service_name in list(self.services.keys()):
                await self.check_service_health(service_name)
                # Clean up stale services
                if service_name in self.services:
                    last_seen = self.services[service_name]["last_seen"]
                    if datetime.now() - last_seen > timedelta(seconds=self.cleanup_interval):
                        self.unregister_service(service_name)
            await asyncio.sleep(self.health_check_interval)

service_registry = ServiceRegistry()

def setup_service_discovery(app: FastAPI):
    @app.on_event("startup")
    async def start_health_checks():
        asyncio.create_task(service_registry.start_periodic_health_checks())
    
    @app.post("/register")
    async def register_service(service_name: str, service_url: str):
        service_registry.register_service(service_name, service_url)
        return {"message": f"Service {service_name} registered successfully"}
    
    @app.post("/unregister")
    async def unregister_service(service_name: str):
        service_registry.unregister_service(service_name)
        return {"message": f"Service {service_name} unregistered successfully"}
    
    @app.get("/services")
    async def get_services():
        return service_registry.get_all_services()
    
    @app.get("/service/{service_name}")
    async def get_service(service_name: str):
        try:
            url = service_registry.get_service_url(service_name)
            return {"service_name": service_name, "url": url}
        except HTTPException as e:
            raise e 