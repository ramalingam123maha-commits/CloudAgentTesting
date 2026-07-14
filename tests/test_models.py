"""Tests for Task domain model."""

import pytest
from taskmanager.models import Priority, Status, Task


def test_task_defaults():
    task = Task(title="Write tests")
    assert task.status == Status.TODO
    assert task.priority == Priority.MEDIUM
    assert task.description is None
    assert len(task.id) == 8


def test_task_complete():
    task = Task(title="Do something")
    task.complete()
    assert task.status == Status.DONE


def test_task_start():
    task = Task(title="Another task")
    task.start()
    assert task.status == Status.IN_PROGRESS


def test_task_priority_values():
    t = Task(title="High prio", priority=Priority.HIGH)
    assert t.priority == Priority.HIGH


def test_task_description():
    t = Task(title="With desc", description="Some details")
    assert t.description == "Some details"
