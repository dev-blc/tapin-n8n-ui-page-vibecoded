from fastapi import FastAPI, APIRouter, HTTPException, Query, Body, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from functools import wraps
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Admin Service configuration
admin_service_url = os.environ.get('ADMIN_SERVICE_URL', 'https://admin-service-production-9d00.up.railway.app')
admin_service_url = admin_service_url.rstrip('/')

if not admin_service_url:
    logger.warning('Admin Service URL not configured. Server will start but requests will fail.')
else:
    logger.info(f'Admin Service URL: {admin_service_url}')

# Admin Service Client
class AdminServiceClient:
    """Client to proxy requests to admin-service microservice"""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.timeout = 30.0

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ):
        """Make async HTTP request to admin-service"""
        url = f"{self.base_url}{endpoint}"
        request_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            **(headers or {})
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    params=params,
                    json=json_data,
                    headers=request_headers
                )
                response.raise_for_status()
                return response.json() if response.content else None
        except httpx.TimeoutException as e:
            logger.error(f'Timeout calling admin-service {endpoint}: {e}')
            raise HTTPException(
                status_code=504,
                detail=f"Request to admin-service timed out: {endpoint}"
            )
        except httpx.HTTPStatusError as e:
            logger.error(f'HTTP error calling admin-service {endpoint}: {e.response.status_code} - {e.response.text}')
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Admin service error: {e.response.text}"
            )
        except httpx.RequestError as e:
            logger.error(f'Request error calling admin-service {endpoint}: {e}')
            raise HTTPException(
                status_code=503,
                detail=f"Unable to connect to admin-service: {str(e)}"
            )

    async def get(self, endpoint: str, params: Optional[Dict] = None, headers: Optional[Dict] = None):
        """GET request to admin-service"""
        return await self._request('GET', endpoint, params=params, headers=headers)

    async def post(self, endpoint: str, json_data: Optional[Dict] = None, headers: Optional[Dict] = None):
        """POST request to admin-service"""
        return await self._request('POST', endpoint, json_data=json_data, headers=headers)

    async def put(self, endpoint: str, json_data: Optional[Dict] = None, headers: Optional[Dict] = None):
        """PUT request to admin-service"""
        return await self._request('PUT', endpoint, json_data=json_data, headers=headers)

    async def patch(self, endpoint: str, json_data: Optional[Dict] = None, headers: Optional[Dict] = None):
        """PATCH request to admin-service"""
        return await self._request('PATCH', endpoint, json_data=json_data, headers=headers)

    async def delete(self, endpoint: str, headers: Optional[Dict] = None):
        """DELETE request to admin-service"""
        return await self._request('DELETE', endpoint, headers=headers)

# Initialize admin service client
admin_client = AdminServiceClient(admin_service_url) if admin_service_url else None

# Helper function to handle admin service errors
def handle_admin_service_error(func):
    """Decorator to handle admin service errors consistently"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f'Unexpected error in {func.__name__}: {e}', exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )
    return wrapper

# Create the main app without a prefix
app = FastAPI(
    title="TapIn Admin Dashboard API",
    description="Proxy API that routes requests to admin-service microservice",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")

# ============================================================================
# Health Check
# ============================================================================

@api_router.get("/")
async def root():
    return {"message": "TapIn Admin Dashboard API - Proxy to admin-service"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint - checks admin-service health"""
    try:
        if admin_client:
            # Try to ping admin-service
            try:
                health_data = await admin_client.get('/health')
                return {
                    "status": "healthy",
                    "admin_service": "connected",
                    "admin_service_health": health_data,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            except Exception as e:
                return {
                    "status": "degraded",
                    "admin_service": "disconnected",
                    "error": str(e),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
        else:
            return {
                "status": "unhealthy",
                "admin_service": "not_configured",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    except Exception as e:
        logger.error(f'Health check error: {e}')
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

# ============================================================================
# Admin Routes - Users (Proxy to admin-service)
# ============================================================================

@admin_router.get("/users")
@handle_admin_service_error
async def get_users(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all users - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {
        "page": page,
        "limit": limit
    }
    if search:
        params["search"] = search
    if status:
        params["status"] = status
    if tier:
        params["tier"] = tier

    return await admin_client.get('/admin/users', params=params)

@admin_router.get("/users/{user_id}")
@handle_admin_service_error
async def get_user(user_id: str):
    """Get user by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/users/{user_id}')

@admin_router.put("/users/{user_id}")
@handle_admin_service_error
async def update_user(user_id: str, data: Dict[str, Any] = Body(...)):
    """Update user information - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/users/{user_id}', json_data=data)

@admin_router.get("/users/{user_id}/engagement")
@handle_admin_service_error
async def get_user_engagement(user_id: str):
    """Get user engagement metrics - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/users/{user_id}/engagement')

@admin_router.get("/users/{user_id}/activity")
@handle_admin_service_error
async def get_user_activity(
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user activity log - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {"limit": limit, "offset": offset}
    return await admin_client.get(f'/admin/users/{user_id}/activity', params=params)

# ============================================================================
# Admin Routes - Dashboard (Proxy to admin-service)
# ============================================================================

@admin_router.get("/dashboard/stats")
@handle_admin_service_error
async def get_dashboard_stats():
    """Get dashboard statistics - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/dashboard/stats')

@admin_router.get("/dashboard/activity")
@handle_admin_service_error
async def get_dashboard_activity(limit: int = Query(10, ge=1, le=100)):
    """Get recent activity feed - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {"limit": limit}
    return await admin_client.get('/admin/dashboard/activity', params=params)

@admin_router.get("/dashboard/content-health")
@handle_admin_service_error
async def get_content_health():
    """Get content health metrics - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/dashboard/content-health')

# ============================================================================
# Admin Routes - Quick Shifts (Proxy to admin-service)
# ============================================================================

@admin_router.get("/quick-shifts/loops")
@handle_admin_service_error
async def get_quick_shift_loops():
    """Get all Quick Shift loops - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/quick-shifts/loops')

@admin_router.get("/quick-shifts/loops/{loop_id}")
@handle_admin_service_error
async def get_quick_shift_loop(loop_id: str):
    """Get Quick Shift loop by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/quick-shifts/loops/{loop_id}')

@admin_router.post("/quick-shifts/loops")
@handle_admin_service_error
async def create_quick_shift_loop(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift loop - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/quick-shifts/loops', json_data=data)

@admin_router.put("/quick-shifts/loops/{loop_id}")
@handle_admin_service_error
async def update_quick_shift_loop(loop_id: str, data: Dict[str, Any] = Body(...)):
    """Update a Quick Shift loop - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/quick-shifts/loops/{loop_id}', json_data=data)

@admin_router.delete("/quick-shifts/loops/{loop_id}")
@handle_admin_service_error
async def delete_quick_shift_loop(loop_id: str):
    """Delete a Quick Shift loop - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/quick-shifts/loops/{loop_id}')

@admin_router.get("/quick-shifts/reframes")
@handle_admin_service_error
async def get_quick_shift_reframes():
    """Get all Quick Shift reframes - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/quick-shifts/reframes')

@admin_router.get("/quick-shifts/reframes/{reframe_id}")
@handle_admin_service_error
async def get_quick_shift_reframe(reframe_id: str):
    """Get Quick Shift reframe by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/quick-shifts/reframes/{reframe_id}')

@admin_router.post("/quick-shifts/reframes")
@handle_admin_service_error
async def create_quick_shift_reframe(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift reframe - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/quick-shifts/reframes', json_data=data)

@admin_router.get("/quick-shifts/protectors")
@handle_admin_service_error
async def get_quick_shift_protectors():
    """Get all Quick Shift protectors - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/quick-shifts/protectors')

@admin_router.get("/quick-shifts/protectors/{protector_id}")
@handle_admin_service_error
async def get_quick_shift_protector(protector_id: str):
    """Get Quick Shift protector by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/quick-shifts/protectors/{protector_id}')

@admin_router.post("/quick-shifts/protectors")
@handle_admin_service_error
async def create_quick_shift_protector(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift protector - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/quick-shifts/protectors', json_data=data)

# ============================================================================
# Admin Routes - Templates (Proxy to admin-service)
# ============================================================================

@admin_router.get("/templates/affirmations")
@handle_admin_service_error
async def get_affirmation_templates():
    """Get all affirmation templates - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/templates/affirmations')

@admin_router.get("/templates/affirmations/{template_id}")
@handle_admin_service_error
async def get_affirmation_template(template_id: str):
    """Get affirmation template by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/templates/affirmations/{template_id}')

@admin_router.post("/templates/affirmations")
@handle_admin_service_error
async def create_affirmation_template(data: Dict[str, Any] = Body(...)):
    """Create a new affirmation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/templates/affirmations', json_data=data)

@admin_router.put("/templates/affirmations/{template_id}")
@handle_admin_service_error
async def update_affirmation_template(template_id: str, data: Dict[str, Any] = Body(...)):
    """Update an affirmation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/templates/affirmations/{template_id}', json_data=data)

@admin_router.delete("/templates/affirmations/{template_id}")
@handle_admin_service_error
async def delete_affirmation_template(template_id: str):
    """Delete an affirmation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/templates/affirmations/{template_id}')

@admin_router.get("/templates/meditations")
@handle_admin_service_error
async def get_meditation_templates():
    """Get all meditation templates - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/templates/meditations')

@admin_router.get("/templates/meditations/{template_id}")
@handle_admin_service_error
async def get_meditation_template(template_id: str):
    """Get meditation template by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/templates/meditations/{template_id}')

@admin_router.post("/templates/meditations")
@handle_admin_service_error
async def create_meditation_template(data: Dict[str, Any] = Body(...)):
    """Create a new meditation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/templates/meditations', json_data=data)

@admin_router.put("/templates/meditations/{template_id}")
@handle_admin_service_error
async def update_meditation_template(template_id: str, data: Dict[str, Any] = Body(...)):
    """Update a meditation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/templates/meditations/{template_id}', json_data=data)

@admin_router.delete("/templates/meditations/{template_id}")
@handle_admin_service_error
async def delete_meditation_template(template_id: str):
    """Delete a meditation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/templates/meditations/{template_id}')

# ============================================================================
# Admin Routes - Plot Twist Extended (Proxy to admin-service)
# ============================================================================

@admin_router.get("/plot-twists/characters")
@handle_admin_service_error
async def get_plot_twist_characters():
    """Get all Plot Twist characters - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/plot-twists/characters')

@admin_router.get("/plot-twists/response-options")
@handle_admin_service_error
async def get_plot_twist_response_options():
    """Get Plot Twist response options - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/plot-twists/response-options')

# ============================================================================
# Admin Routes - Onboarding (Proxy to admin-service)
# ============================================================================

@admin_router.get("/onboarding/characters")
@handle_admin_service_error
async def get_character_mapping():
    """Get character mapping - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/onboarding/characters')

# Include the routers in the main app
app.include_router(api_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for unhandled errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    # Don't handle HTTPException - let FastAPI handle it
    if isinstance(exc, HTTPException):
        raise exc

    logger.error(f'Unhandled exception: {exc}', exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )
