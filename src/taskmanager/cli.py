"""Click CLI entry-point for Task Manager."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

import click
from dateutil.parser import parse as parse_date
from rich.console import Console

from taskmanager.display import console, print_task_detail, print_task_table
from taskmanager.models import Priority, Status, Task
from taskmanager.storage import TaskStorage

err_console = Console(stderr=True, style="bold red")

DEFAULT_DB = Path.home() / ".taskmanager" / "tasks.json"


@click.group()
@click.option(
    "--db",
    default=str(DEFAULT_DB),
    envvar="TASKMANAGER_DB",
    show_default=True,
    help="Path to the tasks JSON database.",
)
@click.pass_context
def main(ctx: click.Context, db: str) -> None:
    """Task Manager — manage your tasks from the terminal."""
    ctx.ensure_object(dict)
    ctx.obj["storage"] = TaskStorage(path=Path(db))


# ---------------------------------------------------------------------------
# add
# ---------------------------------------------------------------------------


@main.command()
@click.argument("title")
@click.option(
    "-p",
    "--priority",
    type=click.Choice([p.value for p in Priority], case_sensitive=False),
    default=Priority.MEDIUM.value,
    show_default=True,
    help="Task priority.",
)
@click.option("-d", "--description", default=None, help="Optional description.")
@click.option("--due", default=None, help="Due date (any parseable format).")
@click.pass_context
def add(
    ctx: click.Context,
    title: str,
    priority: str,
    description: Optional[str],
    due: Optional[str],
) -> None:
    """Add a new task."""
    storage: TaskStorage = ctx.obj["storage"]
    due_dt = None
    if due:
        # Accept any human-readable date string (e.g. "tomorrow", "2024-12-31")
        try:
            due_dt = parse_date(due)
        except Exception:
            err_console.print(f"Could not parse due date: {due!r}")
            sys.exit(1)

    task = Task(
        title=title,
        priority=Priority(priority),
        description=description,
        due_date=due_dt,
    )
    storage.add(task)
    console.print(
        f"[green]✔[/green] Task [dim]{task.id}[/dim] added: [bold]{task.title}[/bold]"
    )


# ---------------------------------------------------------------------------
# list
# ---------------------------------------------------------------------------


@main.command(name="list")
@click.option(
    "--status",
    type=click.Choice([s.value for s in Status], case_sensitive=False),
    default=None,
    help="Filter by status.",
)
@click.option(
    "--priority",
    type=click.Choice([p.value for p in Priority], case_sensitive=False),
    default=None,
    help="Filter by priority.",
)
@click.pass_context
def list_tasks(
    ctx: click.Context,
    status: Optional[str],
    priority: Optional[str],
) -> None:
    """List tasks, optionally filtered."""
    storage: TaskStorage = ctx.obj["storage"]
    tasks = storage.all()
    if status:
        tasks = [t for t in tasks if t.status == Status(status)]
    if priority:
        tasks = [t for t in tasks if t.priority == Priority(priority)]
    print_task_table(tasks)


# ---------------------------------------------------------------------------
# show
# ---------------------------------------------------------------------------


@main.command()
@click.argument("task_id")
@click.pass_context
def show(ctx: click.Context, task_id: str) -> None:
    """Show details of a single task."""
    storage: TaskStorage = ctx.obj["storage"]
    task = storage.get(task_id)
    if task is None:
        err_console.print(f"Task {task_id!r} not found.")
        sys.exit(1)
    print_task_detail(task)


# ---------------------------------------------------------------------------
# start
# ---------------------------------------------------------------------------


@main.command()
@click.argument("task_id")
@click.pass_context
def start(ctx: click.Context, task_id: str) -> None:
    """Mark a task as in-progress."""
    storage: TaskStorage = ctx.obj["storage"]
    task = storage.get(task_id)
    if task is None:
        err_console.print(f"Task {task_id!r} not found.")
        sys.exit(1)
    task.start()
    storage.update(task)
    console.print(
        f"[cyan]▶[/cyan] Task [dim]{task.id}[/dim] started: [bold]{task.title}[/bold]"
    )


# ---------------------------------------------------------------------------
# done
# ---------------------------------------------------------------------------


@main.command()
@click.argument("task_id")
@click.pass_context
def done(ctx: click.Context, task_id: str) -> None:
    """Mark a task as done."""
    storage: TaskStorage = ctx.obj["storage"]
    task = storage.get(task_id)
    if task is None:
        err_console.print(f"Task {task_id!r} not found.")
        sys.exit(1)
    task.complete()
    storage.update(task)
    console.print(
        f"[green]✔[/green] Task [dim]{task.id}[/dim] marked done: [bold]{task.title}[/bold]"
    )


# ---------------------------------------------------------------------------
# delete
# ---------------------------------------------------------------------------


@main.command()
@click.argument("task_id")
@click.pass_context
def delete(ctx: click.Context, task_id: str) -> None:
    """Delete a task."""
    storage: TaskStorage = ctx.obj["storage"]
    task = storage.get(task_id)
    if task is None:
        err_console.print(f"Task {task_id!r} not found.")
        sys.exit(1)
    storage.delete(task_id)
    console.print(
        f"[red]✘[/red] Task [dim]{task_id}[/dim] deleted: [bold]{task.title}[/bold]"
    )
