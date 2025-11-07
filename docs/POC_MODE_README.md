# TapIn Admin Board - POC Mode (Frontend-Only)

## Overview

The application has been converted to a **frontend-only POC mode** where the React app calls n8n webhooks directly without going through the backend proxy.

## Architecture Change

### Before (Proxy Mode)
```
Frontend → Backend API → n8n Webhook → Response → Backend → Frontend
```

### After (POC Mode - Current)
```
Frontend → n8n Webhook (Direct) → Response → Frontend
```

## Configuration

### Environment Variables

The frontend now uses direct webhook URLs configured in `/app/frontend/.env`:

```env
# n8n Webhook URLs - Direct frontend calls (POC mode)
REACT_APP_N8N_WEBHOOK_URL_TEST=https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations
REACT_APP_N8N_WEBHOOK_URL_PROD=https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations
```

### Setup

1. Copy the example environment file:
   ```bash
   cp /app/frontend/.env.example /app/frontend/.env
   ```

2. Update webhook URLs if needed:
   ```bash
   nano /app/frontend/.env
   ```

## How It Works

### Frontend Changes

**File**: `/app/frontend/src/App.js`

1. **Webhook URLs defined directly**:
   ```javascript
   const N8N_WEBHOOKS = {
     test: process.env.REACT_APP_N8N_WEBHOOK_URL_TEST,
     production: process.env.REACT_APP_N8N_WEBHOOK_URL_PROD
   };
   ```

2. **Direct POST to n8n**:
   ```javascript
   const handleSubmit = async () => {
     const webhookUrl = N8N_WEBHOOKS[environment];
     const res = await axios.post(webhookUrl, formData);
     // No backend proxy, direct to n8n
   };
   ```

3. **Enhanced error handling** for direct n8n responses:
   - 404: Webhook not registered/activated
   - 403: Access denied
   - Network errors
   - Generic errors

### Backend Changes

**File**: `/app/backend/server.py`

The `/api/tapin/submit` endpoint is **disabled** and returns HTTP 501:

```python
@app.post("/api/tapin/submit")
async def submit_to_n8n(request: TapInRequest):
    """
    DISABLED: Frontend calls n8n webhooks directly in POC mode.
    """
    raise HTTPException(
        status_code=501,
        detail="Backend proxy disabled. Frontend calls n8n webhooks directly in POC mode."
    )
```

**Original code is commented out** for easy re-enabling if needed.

## UI Behavior

All UI behavior remains **identical**:
- ✅ Same loading states (spinner during submission)
- ✅ Same success states (beautiful results cards)
- ✅ Same error states (helpful error messages)
- ✅ Environment toggle works (test/production)
- ✅ Form validation
- ✅ Skip functionality
- ✅ Download cards as images
- ✅ Mobile responsive

## n8n Webhook Requirements

### Test Webhook
- **URL**: `https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations`
- **Note**: Must be manually activated in n8n
- **Behavior**: Works for ONE call after activation
- **Usage**: Click "Execute workflow" in n8n before testing

### Production Webhook
- **URL**: `https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations`
- **Note**: Should be always active
- **Behavior**: Continuous availability
- **Usage**: Ready for production use

### Webhook Configuration

n8n webhooks must:
1. **Accept POST requests** from any origin (CORS enabled)
2. **Accept JSON payload** with all form fields
3. **Return JSON response** in the expected format:
   ```json
   [
     {
       "affirmation": {
         "tool_type": "affirmation",
         "tool_text": "...",
         "metadata": { "tags": [...], "start_phrase": "..." }
       },
       "meditation": {
         "tool_type": "meditation",
         "tool_text": "...",
         "metadata": { "duration_sec": 195, "tags": [...] }
       }
     }
   ]
   ```

## CORS Considerations

### No CORS Issues (Browser → n8n)
- n8n webhooks are configured to accept cross-origin requests
- No authentication headers needed
- Simple POST request from browser

### If CORS Issues Arise

If you encounter CORS errors, you have options:

1. **Configure n8n CORS** (Recommended):
   - In n8n, enable CORS for your webhook
   - Allow origin: `*` or your specific domain

2. **Re-enable Backend Proxy**:
   - Uncomment code in `/app/backend/server.py`
   - Backend acts as proxy, avoids CORS
   - Update frontend to use backend URL again

## Testing

### Test Direct n8n Call

You can test the webhook directly using curl:

```bash
# Test webhook
curl -X POST https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations \
  -H "Content-Type: application/json" \
  -d '{
    "dbUser": "1/Kumararaja (DeservingOne)",
    "loop": "Too Much on My Plate",
    "feeling": "Overwhelmed",
    "wantedFeeling": "Worthy"
  }'

# Production webhook
curl -X POST https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations \
  -H "Content-Type: application/json" \
  -d '{
    "dbUser": "1/Kumararaja (DeservingOne)",
    "toolChoice": "Affirmation"
  }'
```

### Test Frontend

1. Start the frontend:
   ```bash
   sudo supervisorctl status frontend
   # Should show RUNNING
   ```

2. Open http://localhost:3000

3. Select environment (Test or Production)

4. Complete the form

5. Click "TapIn"

6. **Expected behavior**:
   - Loading spinner appears
   - Direct POST to n8n webhook
   - Success: Beautiful results cards
   - Error: Helpful error message

## Error Messages

### Common Errors

**404 - Webhook Not Found**
```
n8n Webhook Not Available:
The requested webhook "tapintoaffirmations" is not registered.
Click the 'Execute workflow' button on the canvas, then try again.
```
**Solution**: Activate webhook in n8n (test mode)

**Network Error**
```
Unable to reach the n8n webhook. Please check:
1. Your internet connection
2. The webhook URL is correct
3. n8n service is running
```
**Solution**: Check n8n service status and URL

**403 - Access Denied**
```
The webhook may require authentication or has restricted access.
```
**Solution**: Configure webhook permissions in n8n

## Re-enabling Backend Proxy

If you need to switch back to backend proxy mode:

1. **Uncomment backend code** in `/app/backend/server.py`:
   ```python
   @app.post("/api/tapin/submit")
   async def submit_to_n8n(request: TapInRequest):
       # Remove the raise HTTPException line
       # Uncomment all the code below
   ```

2. **Update frontend** `/app/frontend/src/App.js`:
   ```javascript
   const handleSubmit = async () => {
     const res = await axios.post(`${BACKEND_URL}/api/tapin/submit`, {
       environment,
       formData
     });
   };
   ```

3. **Restart services**:
   ```bash
   sudo supervisorctl restart all
   ```

## Benefits of POC Mode

✅ **Simpler architecture** - No backend proxy needed
✅ **Faster responses** - Direct to n8n, no hop
✅ **Easier deployment** - Frontend-only deployment
✅ **Lower latency** - One less network call
✅ **Transparent** - See exact n8n errors
✅ **Cost effective** - No backend server costs

## Limitations of POC Mode

⚠️ **CORS dependency** - Relies on n8n CORS configuration
⚠️ **No rate limiting** - Can't control request rate on backend
⚠️ **No request logging** - Backend doesn't see requests
⚠️ **No transformation** - Can't modify data before sending
⚠️ **Webhook URL exposed** - Visible in browser network tab
⚠️ **No retry logic** - Relies on browser/axios retry

## Security Note

**Webhook URLs are public** in this POC mode. They are visible in:
- Browser network tab
- Frontend JavaScript source
- .env file (if committed)

For production deployments:
1. Use backend proxy mode for sensitive webhooks
2. Implement authentication/authorization
3. Add rate limiting
4. Enable request logging
5. Use environment-specific URLs

## Files Changed

### Modified
- ✅ `/app/frontend/src/App.js` - Direct n8n calls
- ✅ `/app/frontend/.env` - Added webhook URLs
- ✅ `/app/backend/server.py` - Disabled proxy endpoint

### Created
- ✅ `/app/frontend/.env.example` - Environment template
- ✅ `/app/POC_MODE_README.md` - This file

### Unchanged
- ✅ All UI components
- ✅ All styling
- ✅ Form logic and validation
- ✅ Results display
- ✅ Download functionality
- ✅ Mobile responsiveness

## Deployment

### Frontend-Only Deployment

Since this is POC mode, you can deploy just the frontend:

```bash
cd /app/frontend
yarn build
# Deploy the build/ folder to any static hosting:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - GitHub Pages
# - etc.
```

**Environment variables needed**:
```
REACT_APP_N8N_WEBHOOK_URL_TEST=<your-test-webhook>
REACT_APP_N8N_WEBHOOK_URL_PROD=<your-prod-webhook>
```

## Support

### Switching Modes

**POC Mode** (current):
- Frontend → n8n directly
- Fast and simple
- Good for demos and testing

**Proxy Mode** (original):
- Frontend → Backend → n8n
- More control and security
- Better for production

Choose based on your needs!

---

**Status**: ✅ POC mode active and ready for testing!

The application now calls n8n webhooks directly from the browser. All UI behavior remains identical.
