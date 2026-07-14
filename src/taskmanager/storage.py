"""Persistent JSON storage layer for Task Manager."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

from taskmanager.models import Task


class TaskStorage:
    """Read/write tasks from a JSON file on disk."""

    def __init__(self, path: Optional[Path] = None) -> None:
        self._path: Path = path or Path.home() / ".taskmanager" / "tasks.json"
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._tasks: Dict[str, Task] = {}
        self._load()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _load(self) -> None:
        if self._path.exists():
            raw = json.loads(self._path.read_text(encoding="utf-8"))
            self._tasks = {tid: Task.model_validate(t) for tid, t in raw.items()}

    def _save(self) -> None:
        data = {tid: t.model_dump(mode="json") for tid, t in self._tasks.items()}
        self._path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def all(self) -> List[Task]:
        return list(self._tasks.values())

    def get(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def add(self, task: Task) -> Task:
        self._tasks[task.id] = task
        self._save()
        return task

    def update(self, task: Task) -> Task:
        if task.id not in self._tasks:
            raise KeyError(f"Task {task.id!r} not found")
        self._tasks[task.id] = task
        self._save()
        return task

    def delete(self, task_id: str) -> None:
        if task_id not in self._tasks:
            raise KeyError(f"Task {task_id!r} not found")
        del self._tasks[task_id]
        self._save()
