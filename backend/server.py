from fastapi import FastAPI, APIRouter, HTTPException, Query, Body, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure, OperationFailure
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

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'tapin_admin')

# Initialize MongoDB client (connection will be lazy)
client = None
db = None

try:
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    # Test connection
    logger.info(f'Initializing MongoDB connection: {db_name}')
except Exception as e:
    logger.warning(f'Could not initialize MongoDB connection: {e}. Server will start but database operations may fail.')

# Helper function to handle database errors
def handle_db_error(func):
    """Decorator to handle database errors consistently"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            logger.error(f'Database connection error in {func.__name__}: {e}')
            raise HTTPException(
                status_code=503,
                detail=f"Database connection failed. Please ensure MongoDB is running at {mongo_url}"
            )
        except OperationFailure as e:
            logger.error(f'Database operation error in {func.__name__}: {e}')
            raise HTTPException(
                status_code=500,
                detail=f"Database operation failed: {str(e)}"
            )
        except Exception as e:
            logger.error(f'Unexpected error in {func.__name__}: {e}', exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )
    return wrapper

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Generic base model for MongoDB documents
class BaseDocument(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")

    def model_dump_for_db(self):
        data = self.model_dump(exclude_none=True, by_alias=True)
        if '_id' in data:
            data['_id'] = data['_id']
        return data

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint - doesn't require database"""
    try:
        # Try to ping MongoDB if available
        db_status = "unknown"
        if db:
            try:
                await client.admin.command('ping')
                db_status = "connected"
            except Exception:
                db_status = "disconnected"
        else:
            db_status = "not_initialized"
        
        return {
            "status": "healthy",
            "database": db_status,
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

@api_router.post("/status", response_model=StatusCheck)
@handle_db_error
async def create_status_check(input: StatusCheckCreate):
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        status_dict = input.model_dump()
        status_obj = StatusCheck(**status_dict)
        
        # Convert to dict and serialize datetime to ISO string for MongoDB
        doc = status_obj.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.status_checks.insert_one(doc)
        return status_obj
    except Exception as e:
        logger.error(f'Error creating status check: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to create status check: {str(e)}")

@api_router.get("/status", response_model=List[StatusCheck])
@handle_db_error
async def get_status_checks():
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")
    
    try:
        # Exclude MongoDB's _id field from the query results
        status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

        # Convert ISO string timestamps back to datetime objects
        for check in status_checks:
            if isinstance(check.get('timestamp'), str):
                try:
                    check['timestamp'] = datetime.fromisoformat(check['timestamp'])
                except (ValueError, TypeError) as e:
                    logger.warning(f'Error parsing timestamp: {e}')
                    continue

        return status_checks
    except Exception as e:
        logger.error(f'Error getting status checks: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve status checks: {str(e)}")

# ============================================================================
# Admin Routes - Users
# ============================================================================

@admin_router.get("/users")
@handle_db_error
async def get_users(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all users with optional filters and pagination"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        query = {}
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        if status:
            query["status"] = status
        if tier:
            query["tier"] = tier

        skip = (page - 1) * limit
        users = await db.users.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
        total = await db.users.count_documents(query)

        return {
            "data": users or [],
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit if total > 0 else 0
        }
    except Exception as e:
        logger.error(f'Error getting users: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve users: {str(e)}")

@admin_router.get("/users/{user_id}")
@handle_db_error
async def get_user(user_id: str):
    """Get user by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting user {user_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve user: {str(e)}")

@admin_router.put("/users/{user_id}")
@handle_db_error
async def update_user(user_id: str, data: Dict[str, Any] = Body(...)):
    """Update user information"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating user {user_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@admin_router.get("/users/{user_id}/engagement")
@handle_db_error
async def get_user_engagement(user_id: str):
    """Get user engagement metrics"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Calculate engagement metrics
        return {
            "userId": user_id,
            "totalSessions": user.get("totalSessions", 0),
            "lastActive": user.get("lastActive"),
            "engagementScore": user.get("engagementScore", 0),
            "completedQuests": user.get("completedQuests", 0),
            "activeStreak": user.get("activeStreak", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting user engagement {user_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve user engagement: {str(e)}")

@admin_router.get("/users/{user_id}/activity")
@handle_db_error
async def get_user_activity(
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user activity log"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        activities = await db.user_activities.find(
            {"userId": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).skip(offset).limit(limit).to_list(limit)

        return activities or []
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting user activity {user_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve user activity: {str(e)}")

# ============================================================================
# Admin Routes - Dashboard
# ============================================================================

@admin_router.get("/dashboard/stats")
@handle_db_error
async def get_dashboard_stats():
    """Get dashboard statistics"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({"status": "Active"})
        total_content = await db.content.count_documents({})

        # Get recent signups (this month)
        try:
            current_month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            recent_signups = await db.users.count_documents({
                "createdAt": {"$gte": current_month_start.isoformat()}
            })
        except Exception:
            recent_signups = 0

        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "totalContent": total_content,
            "recentSignups": recent_signups
        }
    except Exception as e:
        logger.error(f'Error getting dashboard stats: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard stats: {str(e)}")

@admin_router.get("/dashboard/activity")
@handle_db_error
async def get_dashboard_activity(limit: int = Query(10, ge=1, le=100)):
    """Get recent activity feed"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        activities = await db.activities.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        return activities or []
    except Exception as e:
        logger.error(f'Error getting dashboard activity: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve dashboard activity: {str(e)}")

@admin_router.get("/dashboard/content-health")
@handle_db_error
async def get_content_health():
    """Get content health metrics"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        health_data = []

        try:
            quick_shift_total = await db.quick_shift_loops.count_documents({})
            quick_shift_active = await db.quick_shift_loops.count_documents({"isActive": True})
            health_data.append({
                "type": "Quick Shifts",
                "total": quick_shift_total,
                "active": quick_shift_active,
                "health": "good" if quick_shift_active > 0 else "warning"
            })
        except Exception as e:
            logger.warning(f'Error getting Quick Shifts health: {e}')
            health_data.append({
                "type": "Quick Shifts",
                "total": 0,
                "active": 0,
                "health": "error"
            })

        try:
            plot_twist_total = await db.plot_twists.count_documents({})
            plot_twist_active = await db.plot_twists.count_documents({"isActive": True})
            health_data.append({
                "type": "Plot Twists",
                "total": plot_twist_total,
                "active": plot_twist_active,
                "health": "good" if plot_twist_active > 0 else "warning"
            })
        except Exception as e:
            logger.warning(f'Error getting Plot Twists health: {e}')
            health_data.append({
                "type": "Plot Twists",
                "total": 0,
                "active": 0,
                "health": "error"
            })

        try:
            template_total = await db.templates.count_documents({})
            template_active = await db.templates.count_documents({"isActive": True})
            health_data.append({
                "type": "Templates",
                "total": template_total,
                "active": template_active,
                "health": "good" if template_active > 0 else "warning"
            })
        except Exception as e:
            logger.warning(f'Error getting Templates health: {e}')
            health_data.append({
                "type": "Templates",
                "total": 0,
                "active": 0,
                "health": "error"
            })

        return health_data
    except Exception as e:
        logger.error(f'Error getting content health: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve content health: {str(e)}")

# ============================================================================
# Admin Routes - Quick Shifts
# ============================================================================

@admin_router.get("/quick-shifts/loops")
@handle_db_error
async def get_quick_shift_loops():
    """Get all Quick Shift loops"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        loops = await db.quick_shift_loops.find({}, {"_id": 0}).to_list(1000)
        return loops or []
    except Exception as e:
        logger.error(f'Error getting quick shift loops: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve loops: {str(e)}")

@admin_router.get("/quick-shifts/loops/{loop_id}")
@handle_db_error
async def get_quick_shift_loop(loop_id: str):
    """Get Quick Shift loop by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        loop = await db.quick_shift_loops.find_one({"id": loop_id}, {"_id": 0})
        if not loop:
            raise HTTPException(status_code=404, detail="Loop not found")
        return loop
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting quick shift loop {loop_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve loop: {str(e)}")

@admin_router.post("/quick-shifts/loops")
@handle_db_error
async def create_quick_shift_loop(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift loop"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        loop_id = str(uuid.uuid4())
        data["id"] = loop_id
        await db.quick_shift_loops.insert_one(data)
        loop = await db.quick_shift_loops.find_one({"id": loop_id}, {"_id": 0})
        if not loop:
            raise HTTPException(status_code=500, detail="Failed to retrieve created loop")
        return loop
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating quick shift loop: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to create loop: {str(e)}")

@admin_router.put("/quick-shifts/loops/{loop_id}")
@handle_db_error
async def update_quick_shift_loop(loop_id: str, data: Dict[str, Any] = Body(...)):
    """Update a Quick Shift loop"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.quick_shift_loops.update_one(
            {"id": loop_id},
            {"$set": data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Loop not found")
        loop = await db.quick_shift_loops.find_one({"id": loop_id}, {"_id": 0})
        if not loop:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated loop")
        return loop
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating quick shift loop {loop_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to update loop: {str(e)}")

@admin_router.delete("/quick-shifts/loops/{loop_id}")
@handle_db_error
async def delete_quick_shift_loop(loop_id: str):
    """Delete a Quick Shift loop"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.quick_shift_loops.delete_one({"id": loop_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Loop not found")
        return {"message": "Loop deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error deleting quick shift loop {loop_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to delete loop: {str(e)}")

@admin_router.get("/quick-shifts/reframes")
@handle_db_error
async def get_quick_shift_reframes():
    """Get all Quick Shift reframes"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        reframes = await db.quick_shift_reframes.find({}, {"_id": 0}).to_list(1000)
        return reframes or []
    except Exception as e:
        logger.error(f'Error getting quick shift reframes: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve reframes: {str(e)}")

@admin_router.get("/quick-shifts/reframes/{reframe_id}")
@handle_db_error
async def get_quick_shift_reframe(reframe_id: str):
    """Get Quick Shift reframe by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        reframe = await db.quick_shift_reframes.find_one({"id": reframe_id}, {"_id": 0})
        if not reframe:
            raise HTTPException(status_code=404, detail="Reframe not found")
        return reframe
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting quick shift reframe {reframe_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve reframe: {str(e)}")

@admin_router.post("/quick-shifts/reframes")
@handle_db_error
async def create_quick_shift_reframe(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift reframe"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        reframe_id = str(uuid.uuid4())
        data["id"] = reframe_id
        await db.quick_shift_reframes.insert_one(data)
        reframe = await db.quick_shift_reframes.find_one({"id": reframe_id}, {"_id": 0})
        if not reframe:
            raise HTTPException(status_code=500, detail="Failed to retrieve created reframe")
        return reframe
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating quick shift reframe: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to create reframe: {str(e)}")

@admin_router.get("/quick-shifts/protectors")
@handle_db_error
async def get_quick_shift_protectors():
    """Get all Quick Shift protectors"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        protectors = await db.quick_shift_protectors.find({}, {"_id": 0}).to_list(1000)
        return protectors or []
    except Exception as e:
        logger.error(f'Error getting quick shift protectors: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve protectors: {str(e)}")

@admin_router.get("/quick-shifts/protectors/{protector_id}")
@handle_db_error
async def get_quick_shift_protector(protector_id: str):
    """Get Quick Shift protector by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        protector = await db.quick_shift_protectors.find_one({"id": protector_id}, {"_id": 0})
        if not protector:
            raise HTTPException(status_code=404, detail="Protector not found")
        return protector
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting quick shift protector {protector_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve protector: {str(e)}")

@admin_router.post("/quick-shifts/protectors")
@handle_db_error
async def create_quick_shift_protector(data: Dict[str, Any] = Body(...)):
    """Create a new Quick Shift protector"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        protector_id = str(uuid.uuid4())
        data["id"] = protector_id
        await db.quick_shift_protectors.insert_one(data)
        protector = await db.quick_shift_protectors.find_one({"id": protector_id}, {"_id": 0})
        if not protector:
            raise HTTPException(status_code=500, detail="Failed to retrieve created protector")
        return protector
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating quick shift protector: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to create protector: {str(e)}")

# ============================================================================
# Admin Routes - Templates
# ============================================================================

@admin_router.get("/templates/affirmations")
@handle_db_error
async def get_affirmation_templates():
    """Get all affirmation templates"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        templates = await db.affirmation_templates.find({}, {"_id": 0}).to_list(1000)
        return templates or []
    except Exception as e:
        logger.error(f'Error getting affirmation templates: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve templates: {str(e)}")

@admin_router.get("/templates/affirmations/{template_id}")
@handle_db_error
async def get_affirmation_template(template_id: str):
    """Get affirmation template by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        template = await db.affirmation_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting affirmation template {template_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve template: {str(e)}")

@admin_router.post("/templates/affirmations")
@handle_db_error
async def create_affirmation_template(data: Dict[str, Any] = Body(...)):
    """Create a new affirmation template"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        template_id = str(uuid.uuid4())
        data["id"] = template_id
        await db.affirmation_templates.insert_one(data)
        template = await db.affirmation_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=500, detail="Failed to retrieve created template")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating affirmation template: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@admin_router.put("/templates/affirmations/{template_id}")
@handle_db_error
async def update_affirmation_template(template_id: str, data: Dict[str, Any] = Body(...)):
    """Update an affirmation template"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.affirmation_templates.update_one(
            {"id": template_id},
            {"$set": data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Template not found")
        template = await db.affirmation_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated template")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating affirmation template {template_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to update template: {str(e)}")

@admin_router.delete("/templates/affirmations/{template_id}")
@handle_db_error
async def delete_affirmation_template(template_id: str):
    """Delete an affirmation template"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.affirmation_templates.delete_one({"id": template_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"message": "Template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error deleting affirmation template {template_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to delete template: {str(e)}")

@admin_router.get("/templates/meditations")
@handle_db_error
async def get_meditation_templates():
    """Get all meditation templates"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        templates = await db.meditation_templates.find({}, {"_id": 0}).to_list(1000)
        return templates or []
    except Exception as e:
        logger.error(f'Error getting meditation templates: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve templates: {str(e)}")

@admin_router.get("/templates/meditations/{template_id}")
@handle_db_error
async def get_meditation_template(template_id: str):
    """Get meditation template by ID"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        template = await db.meditation_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error getting meditation template {template_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve template: {str(e)}")

@admin_router.post("/templates/meditations")
@handle_db_error
async def create_meditation_template(data: Dict[str, Any] = Body(...)):
    """Create a new meditation template"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        template_id = str(uuid.uuid4())
        data["id"] = template_id
        await db.meditation_templates.insert_one(data)
        template = await db.meditation_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=500, detail="Failed to retrieve created template")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error creating meditation template: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to create template: {str(e)}")

@admin_router.put("/templates/meditations/{template_id}")
@handle_db_error
async def update_meditation_template(template_id: str, data: Dict[str, Any] = Body(...)):
    """Update a meditation template"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.meditation_templates.update_one(
            {"id": template_id},
            {"$set": data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Template not found")
        template = await db.meditation_templates.find_one({"id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=500, detail="Failed to retrieve updated template")
        return template
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error updating meditation template {template_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to update template: {str(e)}")

@admin_router.delete("/templates/meditations/{template_id}")
@handle_db_error
async def delete_meditation_template(template_id: str):
    """Delete a meditation template"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = await db.meditation_templates.delete_one({"id": template_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"message": "Template deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Error deleting meditation template {template_id}: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to delete template: {str(e)}")

# ============================================================================
# Admin Routes - Plot Twist Extended
# ============================================================================

@admin_router.get("/plot-twists/characters")
@handle_db_error
async def get_plot_twist_characters():
    """Get all Plot Twist characters"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        characters = await db.plot_twist_characters.find({}, {"_id": 0}).to_list(1000)
        return characters or []
    except Exception as e:
        logger.error(f'Error getting plot twist characters: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve characters: {str(e)}")

@admin_router.get("/plot-twists/response-options")
@handle_db_error
async def get_plot_twist_response_options():
    """Get Plot Twist response options"""
    if not db:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        options = await db.plot_twist_response_options.find({}, {"_id": 0}).to_list(1000)
        return options or []
    except Exception as e:
        logger.error(f'Error getting plot twist response options: {e}')
        raise HTTPException(status_code=500, detail=f"Failed to retrieve response options: {str(e)}")

# ============================================================================
# Admin Routes - Character Mapping
# ============================================================================

@admin_router.get("/onboarding/characters")
async def get_character_mapping():
    """Get character mapping (name to UUID) from Supabase"""
    supabase_url = "https://cehslgskpbamfuhkooez.supabase.co/functions/v1/database-access"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(supabase_url)
            response.raise_for_status()
            data = response.json()
            
            # Extract the data array from the response
            characters = data.get("data", [])
            
            # Transform to match expected format if needed
            # The response already has id, name, emoji, description, traits, created_at
            return characters or []
            
    except httpx.TimeoutException as e:
        logger.error(f'Timeout fetching character mapping from Supabase: {e}')
        raise HTTPException(
            status_code=504,
            detail="Request to Supabase timed out. Please try again later."
        )
    except httpx.HTTPStatusError as e:
        logger.error(f'HTTP error fetching character mapping from Supabase: {e.response.status_code} - {e.response.text}')
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch character mapping from Supabase: {e.response.status_code}"
        )
    except httpx.RequestError as e:
        logger.error(f'Request error fetching character mapping from Supabase: {e}')
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to Supabase. Please check the service availability."
        )
    except Exception as e:
        logger.error(f'Unexpected error getting character mapping: {e}', exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve character mapping: {str(e)}"
        )

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

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown"""
    try:
        if client:
            client.close()
            logger.info('MongoDB connection closed')
    except Exception as e:
        logger.error(f'Error closing MongoDB connection: {e}')

# Global exception handler for unhandled errors (excluding HTTPException which is handled by FastAPI)
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