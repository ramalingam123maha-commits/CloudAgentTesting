"""Rich-powered display helpers for Task Manager."""

from __future__ import annotations

from typing import List

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

from taskmanager.models import Priority, Status, Task

console = Console()

_STATUS_STYLE: dict[Status, str] = {
    Status.TODO: "yellow",
    Status.IN_PROGRESS: "cyan",
    Status.DONE: "green",
}

_PRIORITY_STYLE: dict[Priority, str] = {
    Priority.LOW: "dim",
    Priority.MEDIUM: "white",
    Priority.HIGH: "bold red",
}


def _status_text(status: Status) -> str:
    style = _STATUS_STYLE[status]
    return f"[{style}]{status.value}[/{style}]"


def _priority_text(priority: Priority) -> str:
    style = _PRIORITY_STYLE[priority]
    return f"[{style}]{priority.value}[/{style}]"


def print_task_table(tasks: List[Task]) -> None:
    count = len(tasks)
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
    console.print(Panel(body, title=f"Task [dim]{task.id}[/dim]", expand=False))
