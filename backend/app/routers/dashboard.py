from typing import List
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.task import FieldTask
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.dashboard import DashboardStats, TaskByType, ProjectHealth, ActivityItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics."""
    # Get active snags count
    active_snags = db.query(FieldTask).filter(
        FieldTask.status == "Open"
    ).count()

    # Calculate mock data
    return DashboardStats(
        projectHealth="Good",
        activeSnags=active_snags or 42,
        completedPercentage=88,
        daysToDeadline=112
    )


@router.get("/tasks-by-type", response_model=List[TaskByType])
async def get_tasks_by_type(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get task counts by type for charts."""
    # Group by task type
    tasks = db.query(FieldTask.type, func.count(FieldTask.id)).group_by(
        FieldTask.type
    ).all()

    # Map to response format with colors
    color_map = {
        "Defect": "#ef4444",
        "Safety": "#f59e0b",
        "RFI": "#3b82f6",
        "Observation": "#10b981"
    }

    result = []
    for task_type, count in tasks:
        result.append(TaskByType(
            name=task_type,
            count=count or 12,  # Default mock values
            fill=color_map.get(task_type, "#64748b")
        ))

    # Ensure all types are present
    type_names = ["Defects", "Safety", "RFIs", "Observations"]
    for i, type_name in enumerate(type_names):
        if not any(t.name == type_name for t in result):
            result.append(TaskByType(
                name=type_name,
                count=[12, 4, 8, 15][i],
                fill=color_map.get(type_name.replace("s", ""), "#64748b")
            ))

    return result


@router.get("/health", response_model=List[ProjectHealth])
async def get_project_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get project health data for pie chart."""
    return [
        ProjectHealth(
            name="On Track",
            value=75,
            color="#10b981"
        ),
        ProjectHealth(
            name="Delayed",
            value=25,
            color="#f59e0b"
        )
    ]


@router.get("/activity", response_model=List[ActivityItem])
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get recent activity."""
    # Mock activity data
    return [
        ActivityItem(
            id="1",
            user="Alex Mercer",
            action="Uploaded drawing",
            target="A-101 Floorplan",
            time="2 hours ago",
            avatar="AM"
        ),
        ActivityItem(
            id="2",
            user="Sarah Lane",
            action="Closed snag",
            target="Exposed Wiring - L2",
            time="4 hours ago",
            avatar="SL"
        ),
        ActivityItem(
            id="3",
            user="John Smith",
            action="Created RFI",
            target="Foundation Detail Conflict",
            time="Yesterday",
            avatar="JS"
        )
    ]
