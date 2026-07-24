"""Tests for Task domain model."""

import pytest
from taskmanager.models import Priority, Status, Task


def test_task_defaults():
    # A freshly created task should start as TODO with MEDIUM priority and no description
    task = Task(title="Write tests")
    assert task.status == Status.TODO
    assert task.priority == Priority.MEDIUM
    assert task.description is None
    # Auto-generated IDs are truncated UUID4 strings – always 8 chars
    assert len(task.id) == 8


def test_task_complete():
    # Calling complete() must transition the task to the DONE state
    task = Task(title="Do something")
    task.complete()
    assert task.status == Status.DONE


def test_task_start():
    # Calling start() must transition the task to IN_PROGRESS
    task = Task(title="Another task")
    task.start()
    assert task.status == Status.IN_PROGRESS


def test_task_priority_values():
    # Verify that explicit priority assignment is preserved
    t = Task(title="High prio", priority=Priority.HIGH)
    assert t.priority == Priority.HIGH


def test_task_description():
    # Verify that an optional description is stored correctly
    t = Task(title="With desc", description="Some details")
    assert t.description == "Some details"
