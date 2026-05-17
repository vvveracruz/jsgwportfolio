# jsgwportfolio

Static photo portfolio site. Vanilla HTML/JS/CSS, no build step.

## Requirements

- Node.js (prettier, eslint)
- Python + [uv](https://github.com/astral-sh/uv) (ruff, photo sync script)

## Make commands

| Command | What it does |
|---------|-------------|
| `make install` | Install npm and Python deps (`npm install` + `uv sync`) |
| `make serve` | Serve site locally on port 8000 (`PORT=3000 make serve` to override) |
| `make check` | Run all linters and format checks (CI gate) |
| `make lint` | Lint JS and Python without format check |
| `make format` | Auto-format all HTML/CSS/JS/JSON and Python files |
| `make sync` | Sync photos via `scripts/sync_photos.py` |

`make` with no arguments runs `make check`.
