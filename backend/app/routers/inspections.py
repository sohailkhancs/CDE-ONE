from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.inspection import Inspection, ChecklistItem
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.inspection import (
    InspectionResponse,
    InspectionCreate,
    InspectionUpdate,
    ChecklistItemResponse,
    ChecklistItemCreate
)

router = APIRouter(prefix="/inspections", tags=["Inspections"])


@router.get("", response_model=List[InspectionResponse])
async def get_inspections(
    type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    assigned_to: Optional[str] = Query(None, alias="assignedTo"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all inspections with optional filtering."""
    query = db.query(Inspection)

    if type:
        query = query.filter(Inspection.type == type)
    if status_filter:
        query = query.filter(Inspection.status == status_filter)
    if assigned_to:
        query = query.filter(Inspection.assigned_to == assigned_to)

    inspections = query.order_by(Inspection.created_at.desc()).all()

    result = []
    for insp in inspections:
        checklist_items = db.query(ChecklistItem).filter(
            ChecklistItem.inspection_id == insp.id
        ).order_by(ChecklistItem.order).all()

        result.append(InspectionResponse(
            id=insp.id,
            title=insp.title,
            type=insp.type,
            status=insp.status,
            location=insp.location,
            assignedTo=insp.assigned_to or "Unassigned",
            date=insp.date.strftime("%Y-%m-%d") if insp.date else "",
            isoSuitability=insp.iso_suitability or "S3",
            refContainer=insp.ref_container_id,
            checklist=[
                ChecklistItemResponse(
                    id=item.id,
                    label=item.label,
                    checked=item.checked,
                    status=item.status or "Pass",
                    comment=item.comment
                ) for item in checklist_items
            ]
        ))

    return result


@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single inspection by ID."""
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    checklist_items = db.query(ChecklistItem).filter(
        ChecklistItem.inspection_id == insp.id
    ).order_by(ChecklistItem.order).all()

    return InspectionResponse(
        id=insp.id,
        title=insp.title,
        type=insp.type,
        status=insp.status,
        location=insp.location,
        assignedTo=insp.assigned_to or "Unassigned",
        date=insp.date.strftime("%Y-%m-%d") if insp.date else "",
        isoSuitability=insp.iso_suitability or "S3",
        refContainer=insp.ref_container_id,
        checklist=[
            ChecklistItemResponse(
                id=item.id,
                label=item.label,
                checked=item.checked,
                status=item.status or "Pass",
                comment=item.comment
            ) for item in checklist_items
        ]
    )


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    data: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new inspection."""
    from datetime import datetime

    new_inspection = Inspection(
        id=str(uuid.uuid4()),
        title=data.title,
        type=data.type,
        status="Scheduled",
        location=data.location,
        assigned_to=data.assignedTo,
        date=datetime.strptime(data.date, "%Y-%m-%d"),
        iso_suitability=data.isoSuitability,
        ref_container_id=data.refContainer
    )

    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    return InspectionResponse(
        id=new_inspection.id,
        title=new_inspection.title,
        type=new_inspection.type,
        status=new_inspection.status,
        location=new_inspection.location,
        assignedTo=new_inspection.assigned_to,
        date=new_inspection.date.strftime("%Y-%m-%d"),
        isoSuitability=new_inspection.iso_suitability,
        refContainer=new_inspection.ref_container_id,
        checklist=[]
    )


@router.put("/{inspection_id}", response_model=InspectionResponse)
async def update_inspection(
    inspection_id: str,
    data: InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an inspection."""
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    if data.title:
        insp.title = data.title
    if data.status:
        insp.status = data.status

    if data.checklist:
        # Delete existing checklist items
        db.query(ChecklistItem).filter(ChecklistItem.inspection_id == insp.id).delete()

        # Add new checklist items
        for i, item in enumerate(data.checklist):
            new_item = ChecklistItem(
                id=str(uuid.uuid4()),
                inspection_id=insp.id,
                label=item.label,
                checked=item.checked,
                status=item.status,
                comment=item.comment,
                order=i
            )
            db.add(new_item)

    db.commit()
    db.refresh(insp)

    checklist_items = db.query(ChecklistItem).filter(
        ChecklistItem.inspection_id == insp.id
    ).order_by(ChecklistItem.order).all()

    return InspectionResponse(
        id=insp.id,
        title=insp.title,
        type=insp.type,
        status=insp.status,
        location=insp.location,
        assignedTo=insp.assigned_to or "Unassigned",
        date=insp.date.strftime("%Y-%m-%d") if insp.date else "",
        isoSuitability=insp.iso_suitability or "S3",
        refContainer=insp.ref_container_id,
        checklist=[
            ChecklistItemResponse(
                id=item.id,
                label=item.label,
                checked=item.checked,
                status=item.status or "Pass",
                comment=item.comment
            ) for item in checklist_items
        ]
    )


@router.delete("/{inspection_id}")
async def delete_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an inspection."""
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    db.delete(insp)
    db.commit()

    return {"message": "Inspection deleted successfully"}


@router.post("/{inspection_id}/verify", response_model=InspectionResponse)
async def verify_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Verify an inspection (mark as completed with passing status)."""
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    insp.status = "Verified"
    db.commit()
    db.refresh(insp)

    checklist_items = db.query(ChecklistItem).filter(
        ChecklistItem.inspection_id == insp.id
    ).all()

    return InspectionResponse(
        id=insp.id,
        title=insp.title,
        type=insp.type,
        status=insp.status,
        location=insp.location,
        assignedTo=insp.assigned_to or "Unassigned",
        date=insp.date.strftime("%Y-%m-%d") if insp.date else "",
        isoSuitability=insp.iso_suitability or "S3",
        refContainer=insp.ref_container_id,
        checklist=[
            ChecklistItemResponse(
                id=item.id,
                label=item.label,
                checked=item.checked,
                status=item.status or "Pass",
                comment=item.comment
            ) for item in checklist_items
        ]
    )


@router.post("/{inspection_id}/reject", response_model=InspectionResponse)
async def reject_inspection(
    inspection_id: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reject an inspection."""
    insp = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Inspection not found")

    insp.status = "Rejected"
    db.commit()
    db.refresh(insp)

    checklist_items = db.query(ChecklistItem).filter(
        ChecklistItem.inspection_id == insp.id
    ).all()

    return InspectionResponse(
        id=insp.id,
        title=insp.title,
        type=insp.type,
        status=insp.status,
        location=insp.location,
        assignedTo=insp.assigned_to or "Unassigned",
        date=insp.date.strftime("%Y-%m-%d") if insp.date else "",
        isoSuitability=insp.iso_suitability or "S3",
        refContainer=insp.ref_container_id,
        checklist=[
            ChecklistItemResponse(
                id=item.id,
                label=item.label,
                checked=item.checked,
                status=item.status or "Pass",
                comment=item.comment
            ) for item in checklist_items
        ]
    )
