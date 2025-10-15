from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TapIn Admin API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# n8n webhook URLs
N8N_WEBHOOKS = {
    "test": "https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations",
    "production": "https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations"
}

class TapInRequest(BaseModel):
    environment: str = "test"
    formData: Dict[str, Any]

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "tapin-admin-api"}

@app.post("/api/tapin/submit")
async def submit_to_n8n(request: TapInRequest):
    """
    Submit form data to n8n workflow webhook
    """
    try:
        # Get the appropriate webhook URL
        webhook_url = N8N_WEBHOOKS.get(request.environment, N8N_WEBHOOKS["test"])
        
        # Forward request to n8n
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                webhook_url,
                json=request.formData
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"n8n webhook returned error: {response.text}"
                )
            
            return response.json()
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to n8n webhook timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting to n8n: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)