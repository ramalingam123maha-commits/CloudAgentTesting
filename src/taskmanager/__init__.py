"""Task Manager – public package surface."""

# Re-export the core domain types so callers can do `from taskmanager import Task`
from taskmanager.models import Priority, Status, Task
from taskmanager.storage import TaskStorage

# Symbols that constitute the public API of this package
__all__ = ["Task", "Priority", "Status", "TaskStorage"]
# Package version — keep in sync with pyproject.toml
__version__ = "0.1.0"
