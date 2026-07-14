"""Tests for TaskStorage."""

import json
from pathlib import Path

import pytest

from taskmanager.models import Priority, Status, Task
from taskmanager.storage import TaskStorage


@pytest.fixture()
def tmp_storage(tmp_path: Path) -> TaskStorage:
    db = tmp_path / "tasks.json"
    return TaskStorage(path=db)


def test_add_and_retrieve(tmp_storage: TaskStorage):
    task = Task(title="Buy milk")
    tmp_storage.add(task)
    retrieved = tmp_storage.get(task.id)
    assert retrieved is not None
    assert retrieved.title == "Buy milk"


def test_all_returns_all(tmp_storage: TaskStorage):
    tmp_storage.add(Task(title="T1"))
    tmp_storage.add(Task(title="T2"))
    tmp_storage.add(Task(title="T3"))
    assert len(tmp_storage.all()) == 3


def test_update(tmp_storage: TaskStorage):
    task = Task(title="Original")
    tmp_storage.add(task)
    task.complete()
    tmp_storage.update(task)

    updated = tmp_storage.get(task.id)
    assert updated is not None
    assert updated.status == Status.DONE


def test_delete(tmp_storage: TaskStorage):
    task = Task(title="To delete")
    tmp_storage.add(task)
    tmp_storage.delete(task.id)
    assert tmp_storage.get(task.id) is None


def test_delete_nonexistent_raises(tmp_storage: TaskStorage):
    with pytest.raises(KeyError):
        tmp_storage.delete("nope")


def test_update_nonexistent_raises(tmp_storage: TaskStorage):
    task = Task(title="Ghost")
    with pytest.raises(KeyError):
        tmp_storage.update(task)


def test_persistence(tmp_path: Path):
    db = tmp_path / "persist.json"
    s1 = TaskStorage(path=db)
    task = Task(title="Persisted")
    s1.add(task)

    # Re-open
    s2 = TaskStorage(path=db)
    assert s2.get(task.id) is not None
    assert s2.get(task.id).title == "Persisted"  # type: ignore[union-attr]
