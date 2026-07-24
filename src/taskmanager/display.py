"""Rich-powered display helpers for Task Manager."""

from __future__ import annotations

from typing import List

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

from taskmanager.models import Priority, Status, Task

# Shared console instance used by both this module and cli.py
console = Console()

# Maps each Status value to its Rich markup colour
_STATUS_STYLE: dict[Status, str] = {
    Status.TODO: "yellow",
    Status.IN_PROGRESS: "cyan",
    Status.DONE: "green",
}

# Maps each Priority value to its Rich markup style
_PRIORITY_STYLE: dict[Priority, str] = {
    Priority.LOW: "dim",
    Priority.MEDIUM: "white",
    Priority.HIGH: "bold red",
}


def _status_text(status: Status) -> str:
    # Wrap the status label in its associated Rich colour markup
    style = _STATUS_STYLE[status]
    return f"[{style}]{status.value}[/{style}]"


def _priority_text(priority: Priority) -> str:
    # Wrap the priority label in its associated Rich style markup
    style = _PRIORITY_STYLE[priority]
    return f"[{style}]{priority.value}[/{style}]"


def print_task_table(tasks: List[Task]) -> None:
    count = len(tasks)
    # Build a rounded Rich table with a summary title showing the task count
    table = Table(
        box=box.ROUNDED,
        show_header=True,
        header_style="bold magenta",
        title=f"[bold]{count} task{'s' if count != 1 else ''} found[/bold]",
    )
    table.add_column("ID", style="dim", width=10)
    table.add_column("Title", min_width=20)
    table.add_column("Priority", justify="center")
    table.add_column("Status", justify="center")
    table.add_column("Due", justify="center")

    for task in tasks:
        # Display an em-dash when no due date has been set
        due = task.due_date.strftime("%Y-%m-%d") if task.due_date else "—"
        table.add_row(
            task.id,
            task.title,
            _priority_text(task.priority),
            _status_text(task.status),
            due,
        )

    console.print(table)


def print_task_detail(task: Task) -> None:
    # Fall back to a muted placeholder when no description was provided
    desc = task.description or "[dim]No description[/dim]"
    due = task.due_date.strftime("%Y-%m-%d %H:%M") if task.due_date else "—"
    body = (
        f"[bold]Title:[/bold]      {task.title}\n"
        f"[bold]Description:[/bold] {desc}\n"
        f"[bold]Priority:[/bold]   {_priority_text(task.priority)}\n"
        f"[bold]Status:[/bold]     {_status_text(task.status)}\n"
        f"[bold]Due:[/bold]        {due}\n"
        f"[bold]Created:[/bold]    {task.created_at.strftime('%Y-%m-%d %H:%M')}\n"
        f"[bold]Updated:[/bold]    {task.updated_at.strftime('%Y-%m-%d %H:%M')}"
    )
    # Render the detail block inside a panel labelled with the task's short ID
    console.print(Panel(body, title=f"Task [dim]{task.id}[/dim]", expand=False))
