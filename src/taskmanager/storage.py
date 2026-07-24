"""Persistent JSON storage layer for Task Manager."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

from taskmanager.models import Task


class TaskStorage:
    """Read/write tasks from a JSON file on disk."""

    def __init__(self, path: Optional[Path] = None) -> None:
        # Fall back to ~/.taskmanager/tasks.json when no path is supplied
        self._path: Path = path or Path.home() / ".taskmanager" / "tasks.json"
        # Ensure the parent directory exists before any reads or writes
        self._path.parent.mkdir(parents=True, exist_ok=True)
        # In-memory store keyed by task ID for O(1) lookups
        self._tasks: Dict[str, Task] = {}
        self._load()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load(self) -> None:
        # Skip loading if the database file does not exist yet (first run)
        if self._path.exists():
            raw = json.loads(self._path.read_text(encoding="utf-8"))
            # Deserialise each raw dict into a validated Task instance
            self._tasks = {tid: Task.model_validate(t) for tid, t in raw.items()}

    def _save(self) -> None:
        # Serialise every task to a plain dict and write the entire file atomically
        data = {tid: t.model_dump(mode="json") for tid, t in self._tasks.items()}
        self._path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def all(self) -> List[Task]:
        # Return all tasks as a plain list; order is insertion order (Python 3.7+)
        return list(self._tasks.values())

    def get(self, task_id: str) -> Optional[Task]:
        # Returns None when the ID does not exist instead of raising
        return self._tasks.get(task_id)

    def add(self, task: Task) -> Task:
        self._tasks[task.id] = task
        self._save()  # Persist immediately so no data is lost on crash
        return task

    def update(self, task: Task) -> Task:
        if task.id not in self._tasks:
            raise KeyError(f"Task {task.id!r} not found")
        self._tasks[task.id] = task
        self._save()  # Persist immediately so no data is lost on crash
        return task

    def delete(self, task_id: str) -> None:
        if task_id not in self._tasks:
            raise KeyError(f"Task {task_id!r} not found")
        del self._tasks[task_id]
        self._save()  # Persist immediately so no data is lost on crash
