from pydantic import BaseModel
from typing import Optional


class PlannedTaskResponse(BaseModel):
    """Planned task response matching frontend type."""
    id: str
    wbs: str
    name: str
    start: str  # ISO Date
    finish: str  # ISO Date
    duration: int  # in days
    progress: float
    resource: str
    outlineLevel: int
    isExpanded: Optional[bool] = None
    isCritical: Optional[bool] = None
    linkedFieldTaskId: Optional[str] = None
    dependencies: Optional[list] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class PlannedTaskCreate(BaseModel):
    """Planned task creation request."""
    wbs: str
    name: str
    start: str
    finish: str
    duration: int
    resource: str
    outlineLevel: int
    dependencies: Optional[list] = None


class PlannedTaskUpdate(BaseModel):
    """Planned task update request."""
    name: Optional[str] = None
    start: Optional[str] = None
    finish: Optional[str] = None
    duration: Optional[int] = None
    progress: Optional[float] = None
    resource: Optional[str] = None
    dependencies: Optional[list] = None
    linkedFieldTaskId: Optional[str] = None


class FieldTaskResponse(BaseModel):
    """Field task response matching frontend Task type."""
    id: str
    type: str  # Defect, Safety, RFI, Observation
    status: str  # Open, Pending, Closed, Draft
    title: str
    location: dict  # { x: number, y: number }
    assignee: str
    priority: str  # Low, Medium, High, Critical
    due: str
    discipline: str

    class Config:
        from_attributes = True
        populate_by_name = True


class FieldTaskCreate(BaseModel):
    """Field task creation request."""
    type: str
    title: str
    locationX: float
    locationY: float
    assignee: str
    priority: str
    due: str
    discipline: str
    description: Optional[str] = None


class FieldTaskUpdate(BaseModel):
    """Field task update request."""
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    description: Optional[str] = None
