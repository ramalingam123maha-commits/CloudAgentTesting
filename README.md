# Task Manager

A clean, command-line **Task Manager** built in Python using **Click**, **Rich**, and **Pydantic**.

---

## Features

- ➕ Add tasks with title, description, priority, and due-date
- 📋 List all tasks with colour-coded status/priority table
- 🔍 Show full task detail
- ▶ Mark tasks as *in-progress* or *done*
- ❌ Delete tasks
- 💾 Persistent JSON storage (default `~/.taskmanager/tasks.json`)

---

## Project Structure

```
.
├── pyproject.toml          # Build config, dev deps & tool config
├── setup.cfg               # Setuptools metadata (PEP 517 fallback)
├── requirements.txt        # Runtime dependencies
├── requirements-dev.txt    # Dev / test dependencies
├── src/
│   └── taskmanager/
│       ├── __init__.py     # Public package surface
│       ├── models.py       # Pydantic domain models (Task, Priority, Status)
│       ├── storage.py      # JSON persistence layer
│       ├── display.py      # Rich table / panel display helpers
│       └── cli.py          # Click CLI (add, list, show, start, done, delete)
└── tests/
    ├── test_models.py
    ├── test_storage.py
    └── test_cli.py
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `click` | CLI framework |
| `rich` | Terminal tables & panels |
| `pydantic` | Data validation (Task model) |
| `python-dateutil` | Flexible due-date parsing |
| `toml` | Config file support |

Dev extras: `pytest`, `pytest-cov`, `black`, `ruff`, `mypy`

---

## Installation

```bash
# 1. Create a virtual environment
python -m venv .venv && source .venv/bin/activate

# 2. Install (runtime only)
pip install .

# 3. Or install with dev extras
pip install ".[dev]"
```

---

## Usage

```bash
# Add a task
taskmanager add "Write unit tests" -p high --due "2025-01-31"

# List all tasks
taskmanager list

# Filter by status or priority
taskmanager list --status todo
taskmanager list --priority high

# Show task detail
taskmanager show <task-id>

# Start a task
taskmanager start <task-id>

# Complete a task
taskmanager done <task-id>

# Delete a task
taskmanager delete <task-id>

# Use a custom DB file
taskmanager --db /tmp/my_tasks.json list
```

---

## Running Tests

```bash
pytest            # runs tests + coverage report
pytest -v         # verbose
pytest --cov-report=html   # HTML coverage report
```

---

## License

MIT
