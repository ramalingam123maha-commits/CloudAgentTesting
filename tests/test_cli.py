"""CLI integration tests using Click's CliRunner."""

from pathlib import Path

import pytest
from click.testing import CliRunner

from taskmanager.cli import main


# Fixture returns a (CliRunner, db_path_str) tuple so each test gets an isolated DB
@pytest.fixture()
def runner(tmp_path: Path):
    return CliRunner(), str(tmp_path / "tasks.json")


def test_add_task(runner):
    # Happy path: adding a task should exit cleanly and echo the title
    r, db = runner
    result = r.invoke(main, ["--db", db, "add", "Buy bread"])
    assert result.exit_code == 0
    assert "Buy bread" in result.output


def test_add_task_with_priority(runner):
    # Providing an explicit priority should still succeed
    r, db = runner
    result = r.invoke(main, ["--db", db, "add", "Do laundry", "-p", "high"])
    assert result.exit_code == 0
    assert "Do laundry" in result.output


def test_list_empty(runner):
    # Listing against an empty DB should report 0 tasks and exit cleanly
    r, db = runner
    result = r.invoke(main, ["--db", db, "list"])
    assert result.exit_code == 0
    assert "0 tasks" in result.output


def test_list_after_add(runner):
    # All previously added tasks should appear in the list output
    r, db = runner
    r.invoke(main, ["--db", db, "add", "Task A"])
    r.invoke(main, ["--db", db, "add", "Task B"])
    result = r.invoke(main, ["--db", db, "list"])
    assert result.exit_code == 0
    assert "Task A" in result.output
    assert "Task B" in result.output


def test_show_task(runner):
    r, db = runner
    r.invoke(main, ["--db", db, "add", "Show me"])
    # grab the id from the list output
    list_result = r.invoke(main, ["--db", db, "list"])
    # IDs are 8-char hex-like strings; parse from table
    lines = list_result.output.splitlines()
    task_id = None
    for line in lines:
        parts = [p.strip() for p in line.split("│") if p.strip()]
        if parts and len(parts[0]) == 8:
            task_id = parts[0]
            break
    assert task_id is not None
    show_result = r.invoke(main, ["--db", db, "show", task_id])
    assert show_result.exit_code == 0
    assert "Show me" in show_result.output


def test_start_and_done(runner):
    r, db = runner
    r.invoke(main, ["--db", db, "add", "Start-me"])
    list_result = r.invoke(main, ["--db", db, "list"])
    lines = list_result.output.splitlines()
    task_id = None
    for line in lines:
        parts = [p.strip() for p in line.split("│") if p.strip()]
        if parts and len(parts[0]) == 8:
            task_id = parts[0]
            break
    assert task_id is not None

    start_result = r.invoke(main, ["--db", db, "start", task_id])
    assert start_result.exit_code == 0

    done_result = r.invoke(main, ["--db", db, "done", task_id])
    assert done_result.exit_code == 0


def test_delete_task(runner):
    r, db = runner
    r.invoke(main, ["--db", db, "add", "Delete-me"])
    list_result = r.invoke(main, ["--db", db, "list"])
    lines = list_result.output.splitlines()
    task_id = None
    for line in lines:
        parts = [p.strip() for p in line.split("│") if p.strip()]
        if parts and len(parts[0]) == 8:
            task_id = parts[0]
            break
    assert task_id is not None
    del_result = r.invoke(main, ["--db", db, "delete", task_id])
    assert del_result.exit_code == 0
    assert "deleted" in del_result.output


def test_show_nonexistent(runner):
    r, db = runner
    result = r.invoke(main, ["--db", db, "show", "badid123"])
    assert result.exit_code != 0
