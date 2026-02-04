from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.task import PlannedTask, FieldTask
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.task import (
    PlannedTaskResponse,
    PlannedTaskCreate,
    PlannedTaskUpdate,
    FieldTaskResponse,
    FieldTaskCreate,
    FieldTaskUpdate
)

router = APIRouter(prefix="/planner", tags=["Planner"])


@router.get("/tasks", response_model=List[PlannedTaskResponse])
async def get_planned_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all planned tasks."""
    tasks = db.query(PlannedTask).order_by(PlannedTask.created_at).all()

    result = []
    for task in tasks:
        result.append(PlannedTaskResponse(
            id=task.id,
            wbs=task.wbs or "",
            name=task.name,
            start=task.start.strftime("%Y-%m-%d"),
            finish=task.finish.strftime("%Y-%m-%d"),
            duration=task.duration,
            progress=task.progress or 0,
            resource=task.resource or "",
            outlineLevel=task.outline_level or 0,
            isExpanded=task.is_expanded,
            isCritical=task.is_critical,
            linkedFieldTaskId=task.linked_field_task_id,
            dependencies=[]
        ))

    return result


@router.get("/tasks/{task_id}", response_model=PlannedTaskResponse)
async def get_planned_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single planned task by ID."""
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return PlannedTaskResponse(
        id=task.id,
        wbs=task.wbs or "",
        name=task.name,
        start=task.start.strftime("%Y-%m-%d"),
        finish=task.finish.strftime("%Y-%m-%d"),
        duration=task.duration,
        progress=task.progress or 0,
        resource=task.resource or "",
        outlineLevel=task.outline_level or 0,
        isExpanded=task.is_expanded,
        isCritical=task.is_critical,
        linkedFieldTaskId=task.linked_field_task_id,
        dependencies=[]
    )


@router.post("/tasks", response_model=PlannedTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_planned_task(
    data: PlannedTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new planned task."""
    from datetime import datetime

    new_task = PlannedTask(
        id=str(uuid.uuid4()),
        wbs=data.wbs,
        name=data.name,
        start=datetime.strptime(data.start, "%Y-%m-%d"),
        finish=datetime.strptime(data.finish, "%Y-%m-%d"),
        duration=data.duration,
        resource=data.resource,
        outline_level=data.outline_level,
        progress=0
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return PlannedTaskResponse(
        id=new_task.id,
        wbs=new_task.wbs,
        name=new_task.name,
        start=new_task.start.strftime("%Y-%m-%d"),
        finish=new_task.finish.strftime("%Y-%m-%d"),
        duration=new_task.duration,
        progress=0,
        resource=new_task.resource,
        outlineLevel=new_task.outline_level,
        isExpanded=new_task.is_expanded,
        isCritical=new_task.is_critical,
        dependencies=[]
    )


@router.put("/tasks/{task_id}", response_model=PlannedTaskResponse)
async def update_planned_task(
    task_id: str,
    data: PlannedTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a planned task."""
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.name:
        task.name = data.name
    if data.start:
        from datetime import datetime
        task.start = datetime.strptime(data.start, "%Y-%m-%d")
    if data.finish:
        from datetime import datetime
        task.finish = datetime.strptime(data.finish, "%Y-%m-%d")
    if data.duration:
        task.duration = data.duration
    if data.progress is not None:
        task.progress = data.progress
    if data.resource:
        task.resource = data.resource
    if data.linkedFieldTaskId:
        task.linked_field_task_id = data.linkedFieldTaskId

    db.commit()
    db.refresh(task)

    return PlannedTaskResponse(
        id=task.id,
        wbs=task.wbs or "",
        name=task.name,
        start=task.start.strftime("%Y-%m-%d"),
        finish=task.finish.strftime("%Y-%m-%d"),
        duration=task.duration,
        progress=task.progress or 0,
        resource=task.resource or "",
        outlineLevel=task.outline_level,
        isExpanded=task.is_expanded,
        isCritical=task.is_critical,
        linkedFieldTaskId=task.linked_field_task_id,
        dependencies=[]
    )


@router.delete("/tasks/{task_id}")
async def delete_planned_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a planned task."""
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}


@router.put("/tasks/{task_id}/dependencies")
async def update_task_dependencies(
    task_id: str,
    dependencies: list,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update task dependencies."""
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Dependencies are stored as JSON in a separate implementation
    # For now, return success
    return PlannedTaskResponse(
        id=task.id,
        wbs=task.wbs or "",
        name=task.name,
        start=task.start.strftime("%Y-%m-%d"),
        finish=task.finish.strftime("%Y-%m-%d"),
        duration=task.duration,
        progress=task.progress or 0,
        resource=task.resource or "",
        outlineLevel=task.outline_level,
        isExpanded=task.is_expanded,
        isCritical=task.is_critical,
        dependencies=dependencies
    )


@router.post("/tasks/{task_id}/link-field")
async def sync_with_field(
    task_id: str,
    fieldTaskId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Link planned task to field task."""
    task = db.query(PlannedTask).filter(PlannedTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.linked_field_task_id = fieldTaskId
    db.commit()
    db.refresh(task)

    return PlannedTaskResponse(
        id=task.id,
        wbs=task.wbs or "",
        name=task.name,
        start=task.start.strftime("%Y-%m-%d"),
        finish=task.finish.strftime("%Y-%m-%d"),
        duration=task.duration,
        progress=task.progress or 0,
        resource=task.resource or "",
        outlineLevel=task.outline_level,
        isExpanded=task.is_expanded,
        isCritical=task.is_critical,
        linkedFieldTaskId=task.linked_field_task_id,
        dependencies=[]
    )
