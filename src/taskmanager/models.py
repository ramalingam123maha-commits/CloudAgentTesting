"""Domain models for Task Manager."""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Status(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"


class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    status: Status = Status.TODO
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def complete(self) -> None:
        self.status = Status.DONE
        self.updated_at = datetime.utcnow()

    def start(self) -> None:
        self.status = Status.IN_PROGRESS
        self.updated_at = datetime.utcnow()
