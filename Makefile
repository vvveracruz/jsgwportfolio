BIN := node_modules/.bin
PORT ?= 8000

.PHONY: all install serve lint format check sync

all: check

install:
	npm install
	uv sync

serve:
	python3 -m http.server $(PORT)

lint:
	$(BIN)/eslint app.js
	uv run ruff check scripts/

format:
	$(BIN)/prettier --write '*.html' '*.css' '*.js' '*.json'
	uv run ruff format scripts/
	uv run ruff check --fix scripts/

check:
	$(BIN)/prettier --check '*.html' '*.css' '*.js' '*.json'
	$(BIN)/eslint app.js
	uv run ruff check scripts/
	uv run ruff format --check scripts/

sync:
	uv run python scripts/sync_photos.py
