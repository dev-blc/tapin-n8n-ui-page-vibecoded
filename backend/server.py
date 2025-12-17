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
# Admin Routes - Quick Shifts (Proxy to admin-service)
# ============================================================================

@admin_router.get("/quick-shift/get-all")
@handle_admin_service_error
async def get_quick_shift_loops():
    """Get all Quick Shift loops - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/quick-shift/get-all')

@admin_router.get("/quick-shift/get/{loop_id}")
@handle_admin_service_error
async def get_quick_shift_loop(loop_id: str):
    """Get Quick Shift loop by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/quick-shift/get/{loop_id}')

@admin_router.post("/quick-shift/create-loop")
@handle_admin_service_error
async def create_quick_shift_loop(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift loop - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/quick-shift/create-loop', json_data=data)

@admin_router.put("/quick-shift/update-loop/{loop_id}")
@handle_admin_service_error
async def update_quick_shift_loop(loop_id: str, data: Dict[str, Any] = Body(...)):
    """Update a Quick Shift loop - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/quick-shift/update-loop/{loop_id}', json_data=data)

@admin_router.delete("/quick-shift/delete-loop/{loop_id}")
@handle_admin_service_error
async def delete_quick_shift_loop(loop_id: str):
    """Delete a Quick Shift loop - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/quick-shift/delete-loop/{loop_id}')

@admin_router.post("/quick-shift/create-sensation-prompt")
@handle_admin_service_error
async def create_quick_shift_sensation(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift sensation prompt - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/quick-shift/create-sensation-prompt', json_data=data)

@admin_router.get("/quick-shift/get-all-sensation-prompts")
@handle_admin_service_error
async def get_quick_shift_sensations(isActive: bool = Query(...)):
    """Get all Quick Shift sensation prompts - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {"isActive": isActive}
    return await admin_client.get('/admin/quick-shift/get-all-sensation-prompts', params=params)

@admin_router.put("/quick-shift/update-sensation-prompt/{sensation_id}")
@handle_admin_service_error
async def update_quick_shift_sensation(sensation_id: str, data: Dict[str, Any] = Body(...)):
    """Update a Quick Shift sensation prompt - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/quick-shift/update-sensation-prompt/{sensation_id}', json_data=data)

@admin_router.delete("/quick-shift/delete-sensation-prompt/{sensation_id}")
@handle_admin_service_error
async def delete_quick_shift_sensation(sensation_id: str):
    """Delete a Quick Shift sensation prompt - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/quick-shift/delete-sensation-prompt/{sensation_id}')

# ============================================================================
# Admin Routes - Templates (Proxy to admin-service)
# ============================================================================

@admin_router.get("/affirmation-templates")
@handle_admin_service_error
async def get_affirmation_templates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    characterId: Optional[str] = Query(None),
    isActive: Optional[bool] = Query(None)
):
    """Get all affirmation templates - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {"page": page, "limit": limit}
    if search:
        params["search"] = search
    if characterId:
        params["characterId"] = characterId
    if isActive is not None:
        params["isActive"] = isActive

    return await admin_client.get('/admin/affirmation-templates', params=params)

@admin_router.get("/affirmation-templates/{template_id}")
@handle_admin_service_error
async def get_affirmation_template(template_id: str):
    """Get affirmation template by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/affirmation-templates/{template_id}')

@admin_router.post("/affirmation-templates")
@handle_admin_service_error
async def create_affirmation_template(data: Dict[str, Any] = Body(...)):
    """Create a new affirmation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/affirmation-templates', json_data=data)

@admin_router.put("/affirmation-templates/{template_id}")
@handle_admin_service_error
async def update_affirmation_template(template_id: str, data: Dict[str, Any] = Body(...)):
    """Update an affirmation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/affirmation-templates/{template_id}', json_data=data)

@admin_router.delete("/affirmation-templates/{template_id}")
@handle_admin_service_error
async def delete_affirmation_template(template_id: str):
    """Delete an affirmation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/affirmation-templates/{template_id}')

@admin_router.get("/meditation-templates")
@handle_admin_service_error
async def get_meditation_templates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    characterId: Optional[str] = Query(None),
    isActive: Optional[bool] = Query(None)
):
    """Get all meditation templates - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {"page": page, "limit": limit}
    if search:
        params["search"] = search
    if characterId:
        params["characterId"] = characterId
    if isActive is not None:
        params["isActive"] = isActive

    return await admin_client.get('/admin/meditation-templates', params=params)

@admin_router.get("/meditation-templates/{template_id}")
@handle_admin_service_error
async def get_meditation_template(template_id: str):
    """Get meditation template by ID - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get(f'/admin/meditation-templates/{template_id}')

@admin_router.post("/meditation-templates")
@handle_admin_service_error
async def create_meditation_template(data: Dict[str, Any] = Body(...)):
    """Create a new meditation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/meditation-templates', json_data=data)

@admin_router.put("/meditation-templates/{template_id}")
@handle_admin_service_error
async def update_meditation_template(template_id: str, data: Dict[str, Any] = Body(...)):
    """Update a meditation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/meditation-templates/{template_id}', json_data=data)

@admin_router.delete("/meditation-templates/{template_id}")
@handle_admin_service_error
async def delete_meditation_template(template_id: str):
    """Delete a meditation template - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/meditation-templates/{template_id}')

# ============================================================================
# Admin Routes - Plot Twist (Proxy to admin-service)
# ============================================================================

@admin_router.get("/plot-twists")
@handle_admin_service_error
async def get_plot_twist_quests(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    dayNumber: Optional[int] = Query(None),
    createdBy: Optional[str] = Query(None),
    characterId: Optional[str] = Query(None),
    isActive: Optional[bool] = Query(None)
):
    """Get all Plot Twist quests - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    params = {"page": page, "limit": limit}
    if search:
        params["search"] = search
    if tags:
        params["tags"] = tags
    if dayNumber:
        params["dayNumber"] = dayNumber
    if createdBy:
        params["createdBy"] = createdBy
    if characterId:
        params["characterId"] = characterId
    if isActive is not None:
        params["isActive"] = isActive

    return await admin_client.get('/admin/plot-twists', params=params)

@admin_router.post("/plot-twists")
@handle_admin_service_error
async def create_plot_twist_quest(data: Dict[str, Any] = Body(...)):
    """Create a new Plot Twist quest - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/plot-twists', json_data=data)

@admin_router.put("/plot-twists/{quest_id}")
@handle_admin_service_error
async def update_plot_twist_quest(quest_id: str, data: Dict[str, Any] = Body(...)):
    """Update a Plot Twist quest - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/plot-twists/{quest_id}', json_data=data)

@admin_router.delete("/plot-twists/{quest_id}")
@handle_admin_service_error
async def delete_plot_twist_quest(quest_id: str):
    """Delete a Plot Twist quest - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/plot-twists/{quest_id}')

@admin_router.put("/plot-twist-options/{option_id}")
@handle_admin_service_error
async def update_plot_twist_option(option_id: str, data: Dict[str, Any] = Body(...)):
    """Update a plot twist option - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/plot-twist-options/{option_id}', json_data=data)

@admin_router.delete("/plot-twist-options/{option_id}")
@handle_admin_service_error
async def delete_plot_twist_option(option_id: str):
    """Delete a plot twist option - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/plot-twist-options/{option_id}')

@admin_router.put("/plot-twist-responses/{response_id}")
@handle_admin_service_error
async def update_plot_twist_response(response_id: str, data: Dict[str, Any] = Body(...)):
    """Update a plot twist response - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/plot-twist-responses/{response_id}', json_data=data)

@admin_router.delete("/plot-twist-responses/{response_id}")
@handle_admin_service_error
async def delete_plot_twist_response(response_id: str):
    """Delete a plot twist response - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/plot-twist-responses/{response_id}')

# ============================================================================
# Admin Routes - Characters (Proxy to admin-service)
# ============================================================================

@admin_router.get("/characters")
@handle_admin_service_error
async def get_characters():
    """Get all characters - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/characters')

@admin_router.post("/characters")
@handle_admin_service_error
async def create_character(data: Dict[str, Any] = Body(...)):
    """Create a new character - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/characters', json_data=data)

@admin_router.put("/characters/{character_id}")
@handle_admin_service_error
async def update_character(character_id: str, data: Dict[str, Any] = Body(...)):
    """Update a character - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/characters/{character_id}', json_data=data)

@admin_router.delete("/characters/{character_id}")
@handle_admin_service_error
async def delete_character(character_id: str):
    """Delete a character - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/characters/{character_id}')

# ============================================================================
# Admin Routes - Onboarding (Proxy to admin-service)
# ============================================================================

@admin_router.get("/onboarding/questions")
@handle_admin_service_error
async def get_onboarding_questions():
    """Get all onboarding questions - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.get('/admin/onboarding/questions')

@admin_router.post("/onboarding/questions")
@handle_admin_service_error
async def create_onboarding_question(data: Dict[str, Any] = Body(...)):
    """Create a new onboarding question - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/onboarding/questions', json_data=data)

@admin_router.put("/onboarding/questions/{question_id}")
@handle_admin_service_error
async def update_onboarding_question(question_id: str, data: Dict[str, Any] = Body(...)):
    """Update an onboarding question - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/onboarding/questions/{question_id}', json_data=data)

@admin_router.delete("/onboarding/questions/{question_id}")
@handle_admin_service_error
async def delete_onboarding_question(question_id: str):
    """Delete an onboarding question - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/onboarding/questions/{question_id}')

@admin_router.post("/onboarding/options")
@handle_admin_service_error
async def create_onboarding_option(data: Dict[str, Any] = Body(...)):
    """Create a new onboarding option - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.post('/admin/onboarding/options', json_data=data)

@admin_router.put("/onboarding/options/{option_id}")
@handle_admin_service_error
async def update_onboarding_option(option_id: str, data: Dict[str, Any] = Body(...)):
    """Update an onboarding option - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.put(f'/admin/onboarding/options/{option_id}', json_data=data)

@admin_router.delete("/onboarding/options/{option_id}")
@handle_admin_service_error
async def delete_onboarding_option(option_id: str):
    """Delete an onboarding option - proxied to admin-service"""
    if not admin_client:
        raise HTTPException(status_code=503, detail="Admin service not configured")

    return await admin_client.delete(f'/admin/onboarding/options/{option_id}')

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
