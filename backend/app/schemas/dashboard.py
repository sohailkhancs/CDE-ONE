from pydantic import BaseModel
from typing import List


class DashboardStats(BaseModel):
    """Dashboard statistics."""
    projectHealth: str
    activeSnags: int
    completedPercentage: int
    daysToDeadline: int


class TaskByType(BaseModel):
    """Task count by type for charts."""
    name: str
    count: int
    fill: str  # Color hex code


class ProjectHealth(BaseModel):
    """Project health data for pie chart."""
    name: str
    value: int
    color: str


class ActivityItem(BaseModel):
    """Recent activity item."""
    id: str
    user: str
    action: str
    target: str
    time: str
    avatar: str
