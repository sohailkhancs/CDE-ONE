# CDE-ONE Backend

FastAPI backend for the CDE-ONE Common Data Environment construction management system.

## Features

- **JWT Authentication** - Secure token-based auth with refresh tokens
- **Document Management** - ISO 19650 compliant information containers
- **Inspections** - QA/QC, Safety, and Environmental inspections
- **Project Planning** - Gantt chart/schedule management
- **Team Management** - User and role management
- **Dashboard Analytics** - Project statistics and activity tracking

## Quick Start

### 1. Create virtual environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Copy `.env.example` to `.env` and update settings:

```bash
cp .env.example .env
```

Edit `.env`:
```ini
DATABASE_URL=sqlite:///./cde_one.db
SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### 4. Initialize database

```bash
python init_db.py
```

This creates the database tables and seeds it with sample data.

### 5. Run the server

```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Default Users

After running `init_db.py`, you can login with:

| Email | Password | Role |
|-------|----------|------|
| admin@skyline.com | admin123 | Admin |
| alex.m@skyline.com | pm123 | Project Manager |

## Project Structure

```
backend/
├── app/
│   ├── core/           # Configuration, security
│   ├── db/             # Database connection
│   ├── models/         # SQLAlchemy models
│   ├── routers/        # API route handlers
│   └── schemas/        # Pydantic schemas
├── main.py             # FastAPI application
├── init_db.py          # Database initialization
├── requirements.txt    # Python dependencies
└── .env               # Environment configuration
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Documents
- `GET /api/v1/documents` - List all documents
- `GET /api/v1/documents/{id}` - Get document details
- `POST /api/v1/documents` - Create document
- `PUT /api/v1/documents/{id}` - Update document
- `DELETE /api/v1/documents/{id}` - Delete document
- `POST /api/v1/documents/{id}/workflow` - Promote through ISO workflow

### Inspections
- `GET /api/v1/inspections` - List all inspections
- `GET /api/v1/inspections/{id}` - Get inspection details
- `POST /api/v1/inspections` - Create inspection
- `PUT /api/v1/inspections/{id}` - Update inspection
- `POST /api/v1/inspections/{id}/verify` - Verify inspection
- `POST /api/v1/inspections/{id}/reject` - Reject inspection

### Planner
- `GET /api/v1/planner/tasks` - Get all tasks
- `GET /api/v1/planner/tasks/{id}` - Get task details
- `POST /api/v1/planner/tasks` - Create task
- `PUT /api/v1/planner/tasks/{id}` - Update task
- `DELETE /api/v1/planner/tasks/{id}` - Delete task
- `POST /api/v1/planner/tasks/{id}/link-field` - Link to field task

### Team
- `GET /api/v1/team` - List team members
- `GET /api/v1/team/{id}` - Get member details
- `POST /api/v1/team/invite` - Invite team member
- `PUT /api/v1/team/{id}` - Update member
- `DELETE /api/v1/team/{id}` - Remove member
- `PUT /api/v1/team/{id}/role` - Update role

### Dashboard
- `GET /api/v1/dashboard/stats` - Get statistics
- `GET /api/v1/dashboard/tasks-by-type` - Get task breakdown
- `GET /api/v1/dashboard/health` - Get project health
- `GET /api/v1/dashboard/activity` - Get recent activity

## Database

The backend uses SQLAlchemy ORM and supports:

- **SQLite** (default) - Great for development
- **PostgreSQL** - Recommended for production

To use PostgreSQL, update `.env`:
```ini
DATABASE_URL=postgresql://cde_user:password@localhost:5432/cde_one_db
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app --cov-report=html
```

## Production Deployment

1. Set strong `SECRET_KEY` in environment
2. Use PostgreSQL database
3. Configure CORS for your frontend domain
4. Run with multiple workers:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```
5. Use a process manager like gunicorn or supervisor
6. Configure reverse proxy (nginx/Apache)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./cde_one.db` |
| `SECRET_KEY` | JWT signing key | (required) |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | 7 |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `ENVIRONMENT` | Environment | `development` |
