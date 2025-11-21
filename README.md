# TapIn Admin Dashboard

Full-stack admin dashboard application with FastAPI proxy backend and React frontend.

## 🏗️ Architecture

This application uses a **microservices architecture**:
- **Frontend**: React application (port 3000)
- **Backend Proxy**: FastAPI service (port 8001) that routes all requests to the admin-service microservice
- **Admin Service**: External microservice that handles all database operations (https://admin-service-production-9d00.up.railway.app)

The backend acts as a **proxy/router** - it does NOT access the database directly. All database operations are handled by the admin-service microservice.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **Python 3** (v3.8 or higher)
- **npm** or **yarn**

### Installation & Setup

1. **Clone the repository** (if not already done)

2. **Install all dependencies:**
   ```bash
   npm run setup
   ```
   Or manually:
   ```bash
   # Backend dependencies
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..

   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Configure Environment Variables:**

   You need **separate `.env` files** for backend and frontend:

   **Backend** (`backend/.env`):
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

   **Frontend** (`frontend/.env`):
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

   > **Why separate files?** React requires environment variables to be prefixed with `REACT_APP_` and they're only available at build time. Backend uses standard environment variables. They serve different purposes and need separate configuration files.

4. **Start both servers:**
   ```bash
   # Option 1: Using npm (cross-platform)
   npm start

   # Option 2: Using bash script (Unix/macOS/Linux)
   ./start.sh

   # Option 3: Using Node.js script directly
   node start.js
   ```

   This will start:
   - **Backend**: http://localhost:8001
   - **Frontend**: http://localhost:3000
   - **API Docs**: http://localhost:8001/docs

## 📁 Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_SERVICE_URL` | Admin service microservice URL | `https://admin-service-production-9d00.up.railway.app` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `*` |

**Example `backend/.env`:**
```env
ADMIN_SERVICE_URL=https://admin-service-production-9d00.up.railway.app
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

> **Note**: The backend does NOT connect to a database. It proxies all requests to the admin-service microservice.

### Frontend Environment Variables (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Local backend API URL | `http://localhost:8001` |
| `REACT_APP_ADMIN_SERVICE_URL` | External admin service URL | `https://admin-service-production-9d00.up.railway.app` |
| `REACT_APP_API_BASE_URL` | Legacy API base URL | `https://admin-service-production-9d00.up.railway.app` |
| `DISABLE_HOT_RELOAD` | Disable hot reload (debugging) | `false` |

**Example `frontend/.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_ADMIN_SERVICE_URL=https://admin-service-production-9d00.up.railway.app
REACT_APP_API_BASE_URL=https://admin-service-production-9d00.up.railway.app
DISABLE_HOT_RELOAD=false
```

> **Note:** All frontend environment variables must be prefixed with `REACT_APP_` to be accessible in the React application.

## 🛠️ Development

### Running Services Individually

**Backend only:**
```bash
npm run start:backend
# or
cd backend && ./start.sh
```

**Frontend only:**
```bash
npm run start:frontend
# or
cd frontend && npm start
```

### Project Structure

```
tapin-n8n-ui-page-vibecoded/
├── backend/              # FastAPI proxy backend (routes to admin-service)
│   ├── .env             # Backend environment variables (create from .env.example)
│   ├── .env.example     # Backend environment template
│   ├── server.py        # Main FastAPI proxy application
│   ├── requirements.txt # Python dependencies
│   └── start.sh         # Backend startup script
├── frontend/            # React frontend
│   ├── .env             # Frontend environment variables (create from .env.example)
│   ├── .env.example     # Frontend environment template
│   ├── src/             # React source code
│   └── package.json     # Node.js dependencies
├── start.sh             # Bash script to run both services
├── start.js             # Node.js script to run both services (cross-platform)
└── package.json         # Root package.json with convenience scripts
```

### How It Works

1. **Frontend** makes API requests to the local backend (http://localhost:8001)
2. **Backend Proxy** receives the request and forwards it to the admin-service microservice
3. **Admin Service** handles all database operations and returns the response
4. **Backend Proxy** returns the response to the frontend

This architecture allows:
- Centralized database logic in the admin-service
- Easy scaling and deployment
- Separation of concerns
- The backend can be deployed independently or removed if frontend calls admin-service directly

## 📝 Environment Setup FAQ

### Do I need one or two `.env` files?

**You need TWO separate `.env` files:**
- `backend/.env` - For backend (Python/FastAPI) environment variables
- `frontend/.env` - For frontend (React) environment variables

**Why?**
- React requires environment variables to be prefixed with `REACT_APP_` and they're only available at build time
- Backend uses standard environment variables without prefixes
- They serve different purposes and are loaded by different processes

### Why does the backend proxy to admin-service instead of accessing the database directly?

This architecture provides:
- **Separation of concerns**: Database logic is centralized in the admin-service
- **Scalability**: The admin-service can be scaled independently
- **Security**: Database credentials are only in the admin-service
- **Flexibility**: The backend can be removed if the frontend calls admin-service directly
- **Consistency**: All database operations go through the same service

### How do I create the `.env` files?

1. Copy the example files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Edit the `.env` files with your actual values (if different from defaults)

3. The startup scripts will automatically load these files

## 🐛 Troubleshooting

### Port Already in Use

If you see warnings about ports being in use:
- **Port 8001 (Backend)**: Stop any other services using this port or change `MONGO_URL` if needed
- **Port 3000 (Frontend)**: Stop any other React apps or change the port in `frontend/package.json`

### Admin Service Connection Issues

- Check that the admin-service is accessible at the configured URL
- Verify `ADMIN_SERVICE_URL` in `backend/.env` is correct
- Check network connectivity to the admin-service
- Review admin-service logs if requests are failing

### Environment Variables Not Loading

- Ensure `.env` files are in the correct directories (`backend/.env` and `frontend/.env`)
- For frontend: Restart the dev server after changing `.env` files (React env vars are loaded at build time)
- For backend: The server will reload automatically with `--reload` flag

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

## 📄 License

ISC
