from pydantic import BaseModel
from typing import Optional, List


class ChecklistItemResponse(BaseModel):
    """Checklist item response."""
    id: str
    label: str
    checked: bool
    status: str  # Pass, Fail, N/A
    comment: Optional[str] = None

    class Config:
        from_attributes = True


class ChecklistItemCreate(BaseModel):
    """Checklist item creation request."""
    label: str
    status: str = "Pass"


class InspectionResponse(BaseModel):
    """Inspection response matching frontend type."""
    id: str
    title: str
    type: str  # QA, QC, Safety, Environmental, Commissioning
    status: str
    location: str
    assignedTo: str
    date: str
    isoSuitability: str
    refContainer: Optional[str] = None
    checklist: List[ChecklistItemResponse]

    class Config:
        from_attributes = True
        populate_by_name = True


class InspectionCreate(BaseModel):
    """Inspection creation request."""
    title: str
    type: str
    location: str
    assignedTo: str
    date: str
    isoSuitability: str
    refContainer: Optional[str] = None


class InspectionUpdate(BaseModel):
    """Inspection update request."""
    title: Optional[str] = None
    status: Optional[str] = None
    checklist: Optional[List[ChecklistItemResponse]] = None
