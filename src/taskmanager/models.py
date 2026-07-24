"""Domain models for Task Manager."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# Possible priority levels for a task, stored as lowercase strings
class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# Lifecycle states a task can be in
class Status(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Task(BaseModel):
    # Use the first 8 chars of a UUID4 for a short, human-friendly ID
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    status: Status = Status.TODO
    due_date: Optional[datetime] = None
    # Both timestamps default to creation time; updated_at is refreshed on state changes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def complete(self) -> None:
        # Transition the task to DONE and record when it happened
        self.status = Status.DONE
        self.updated_at = datetime.utcnow()

    def start(self) -> None:
        # Transition the task to IN_PROGRESS and record when it happened
        self.status = Status.IN_PROGRESS
        self.updated_at = datetime.utcnow()
