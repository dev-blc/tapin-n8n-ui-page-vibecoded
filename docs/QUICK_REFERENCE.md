# TapIn Admin Board - Quick Reference

## 🚀 POC Mode Active

The app now calls n8n webhooks **directly from the browser** (no backend proxy).

## 📍 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `/app/frontend/.env` | Webhook URLs configuration | ✅ Active |
| `/app/frontend/.env.example` | Environment template | ✅ Created |
| `/app/frontend/src/App.js` | Direct n8n calls | ✅ Updated |
| `/app/backend/server.py` | Backend proxy endpoint | ❌ Disabled (501) |
| `/app/POC_MODE_README.md` | Full documentation | ✅ Created |

## 🔧 Configuration

### Webhook URLs (in `/app/frontend/.env`)

```env
REACT_APP_N8N_WEBHOOK_URL_TEST=https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations
REACT_APP_N8N_WEBHOOK_URL_PROD=https://dev-blc.app.n8n.cloud/webhook/tapintoaffirmations
```

## 🎯 How It Works

```
Browser → n8n Webhook (Direct POST) → Response → Display
```

**No backend proxy involved!**

## ✅ What's Identical

- Same beautiful UI
- Same loading states
- Same success/error messages
- Same environment toggle
- Same form validation
- Same skip functionality
- Same download feature
- Same mobile responsiveness

## 📝 Testing

### Quick Test
```bash
# Frontend
open http://localhost:3000

# Backend (should return 501)
curl -X POST http://localhost:8001/api/tapin/submit \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

### Expected Results

**Frontend**: ✅ Works perfectly
**Backend endpoint**: ❌ Returns 501 error

## 🔄 Switching Modes

### To Re-enable Backend Proxy

1. Edit `/app/backend/server.py`
2. Remove `raise HTTPException` line
3. Uncomment all code below
4. Update frontend to use `BACKEND_URL` again
5. Restart services: `sudo supervisorctl restart all`

### To Keep POC Mode

No action needed! Already configured.

## 🎨 UI Behavior

| Feature | Status | Notes |
|---------|--------|-------|
| Environment Toggle | ✅ Working | Test/Production |
| Skip Button | ✅ Working | On skippable steps |
| Form Validation | ✅ Working | Required fields |
| Progress Bar | ✅ Working | Dynamic calculation |
| Card Selection | ✅ Working | All field types |
| Error Handling | ✅ Enhanced | Direct n8n errors |
| Loading State | ✅ Working | Spinner during submit |
| Results Display | ✅ Working | Beautiful cards |
| Download Feature | ✅ Working | PNG export |

## 📊 Form Stats

- **Total fields**: 32+
- **Steps**: 23-33 (dynamic)
- **Field types**: 6 different
- **Conditional fields**: 6

## 🔍 Key Changes

### Frontend (`App.js`)

**Before:**
```javascript
axios.post(`${BACKEND_URL}/api/tapin/submit`, {
  environment,
  formData
})
```

**After:**
```javascript
const webhookUrl = N8N_WEBHOOKS[environment];
axios.post(webhookUrl, formData)
```

### Backend (`server.py`)

**Before:**
```python
# Forward to n8n and return response
```

**After:**
```python
# Return 501 - Not Implemented
raise HTTPException(status_code=501, detail="...")
```

## ⚠️ Important Notes

1. **CORS**: n8n webhooks must allow cross-origin requests
2. **Public URLs**: Webhook URLs visible in browser
3. **No Auth**: Direct POST, no authentication layer
4. **Error Messages**: See n8n errors directly
5. **Network Tab**: Can inspect requests in browser

## 🚢 Deployment

Frontend-only deployment ready:

```bash
cd /app/frontend
yarn build
# Deploy build/ folder to:
# - Netlify, Vercel, AWS S3, etc.
```

**Required env vars**:
- `REACT_APP_N8N_WEBHOOK_URL_TEST`
- `REACT_APP_N8N_WEBHOOK_URL_PROD`

## 📱 Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001 (health check only)
- **Backend Submit**: Returns 501 (disabled)

## 🎯 Quick Commands

```bash
# Check services
sudo supervisorctl status

# Restart services
sudo supervisorctl restart all

# View logs
tail -f /var/log/supervisor/frontend.out.log
tail -f /var/log/supervisor/backend.out.log

# Test backend health
curl http://localhost:8001/api/health

# Test webhook (if active)
curl -X POST https://dev-blc.app.n8n.cloud/webhook-test/tapintoaffirmations \
  -H "Content-Type: application/json" \
  -d '{"dbUser":"test"}'
```

## ✨ Summary

**POC Mode = Frontend-Only**
- ✅ Direct n8n webhook calls
- ✅ No backend proxy
- ✅ Simpler architecture
- ✅ Faster responses
- ✅ Easy deployment
- ✅ Identical UI/UX

**Perfect for demos and closed POCs!**

---

For full documentation, see `/app/POC_MODE_README.md`
