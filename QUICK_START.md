# Quick Start Guide - CDE-ONE

## How to Run the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend URL:** `http://localhost:8000`

### 2. Start Frontend (Terminal 2)
```bash
npm run dev
```

**Frontend URL (Default):** `http://localhost:3000`

---

## Supported Frontend Ports

The backend now supports multiple development ports. You can run the frontend on:

| Port | Command | Status |
|------|---------|--------|
| **3000** | `npm run dev` | ✅ Default (Recommended) |
| **3001** | `npm run dev -- --port 3001` | ✅ Now Supported |
| **5173** | Vite default | ✅ Supported |
| **5174** | Alternate Vite | ✅ Supported |

### To Run on Different Port:

```bash
# Port 3001
npm run dev -- --port 3001

# Port 5173
npm run dev -- --port 5173

# Or any other port
npm run dev -- --port 4000
```

---

## Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@skyline.com | admin123 | Admin |
| alex.m@skyline.com | pm123 | Project Manager |

---

## Application URLs

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8000 | API endpoints |
| **API Docs** | http://localhost:8000/docs | Swagger documentation |
| **Health Check** | http://localhost:8000/health | Backend status |

---

## Common Issues & Solutions

### Issue: "Login Failed" on Port 3001

**Cause:** Backend CORS was blocking port 3001

**Solution:** ✅ **FIXED** - Backend now accepts ports 3000, 3001, 5173, 5174

### Issue: Port 3000 Already in Use

**Solution 1:** Use a different port:
```bash
npm run dev -- --port 3001
```

**Solution 2:** Kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Backend Not Starting

**Check:**
1. Make sure you're in the `backend` directory
2. Make sure port 8000 is not already in use
3. Check if dependencies are installed: `pip install -r requirements.txt`

### Issue: Frontend Not Starting

**Check:**
1. Make sure dependencies are installed: `npm install`
2. Check if port is available
3. Try clearing cache: `rm -rf node_modules/.vite`

---

## Development Workflow

### Initial Setup (One Time)
```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Initialize database
python init_db.py
```

### Daily Development
```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start frontend (new terminal)
npm run dev
```

### Access the Application
1. Open browser: `http://localhost:3000`
2. Login with: `admin@skyline.com` / `admin123`
3. Start using the application!

---

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Documents
- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Upload document
- `GET /api/v1/documents/{id}/preview` - Preview document
- `GET /api/v1/documents/{id}/thumbnail` - Get thumbnail
- `GET /api/v1/documents/{id}/download` - Download document
- `DELETE /api/v1/documents/{id}` - Delete document
- `POST /api/v1/documents/{id}/workflow` - Promote workflow

### Other Features
- `GET /api/v1/inspections` - List inspections
- `GET /api/v1/planner/tasks` - Get planned tasks
- `GET /api/v1/team` - Get team members
- `GET /api/v1/dashboard` - Get dashboard stats

---

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8000/api/v1
GEMINI_API_KEY=your-gemini-key-here
```

### Backend (.env)
```env
DATABASE_URL=sqlite:///./cde_one.db
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:3000
```

---

## File Structure

```
cde-one/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Config, security
│   │   ├── db/             # Database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   └── schemas/        # Pydantic schemas
│   ├── uploads/            # Uploaded files (gitignored)
│   ├── main.py             # FastAPI app
│   └── requirements.txt
│
├── src/                    # React frontend
│   ├── features/
│   │   ├── auth/           # Authentication
│   │   ├── documents/      # Documents module
│   │   ├── inspections/    # Inspections module
│   │   ├── planner/        # Gantt planner
│   │   ├── team/           # Team management
│   │   └── dashboard/      # Dashboard
│   ├── lib/                # Utilities
│   └── main.tsx            # App entry
│
└── package.json
```

---

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Safari | 14+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |

---

## Need Help?

### Check Backend Status
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "CDE-ONE Backend Online",
  "environment": "development"
}
```

### Check Frontend Status
Open browser DevTools (F12) → Console tab
Should see no red errors

### View API Documentation
Open: `http://localhost:8000/docs`

---

## Tips

1. **Keep both terminals running** during development
2. **Backend auto-reloads** when you save Python files
3. **Frontend hot-reloads** when you save React files
4. **Check browser console** for JavaScript errors
5. **Check backend terminal** for API errors

---

## Status

- ✅ Backend: Running on `http://localhost:8000`
- ✅ Frontend: Ready to start
- ✅ CORS: Configured for ports 3000, 3001, 5173, 5174
- ✅ Database: Initialized with seed data

**Ready to use!**
