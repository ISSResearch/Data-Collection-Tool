<!-- <img src="/docs/assets/preview.gif" alt="example"> -->

# ISS Data Collection Tool

An end-to-end dataset annotation and management system built for scale. Supports multi-role workflows, structured label taxonomies, validation cycles, goal tracking, and archive exports. Ideal for organizations building private, high-integrity datasets.

🛠 Currently in active development. Ideal for internal use, pilots, and research-stage projects.

## 🧩 Features

This platform enables you to:

- Create projects with custom label systems
- Upload images/videos and assign them to labeling schemas
- validate uploaded files
- Set collection goals
- Track progress with stats
- Export data

## 📚 Documentation & Examples

See [docs/](/docs) for manuals and walkthroughs:

- [Quickstart](/docs/quickstart.md)
- [Projects](/docs/projects.md)
- [Labels](/docs/labels.md)
- [Users and Roles](/docs/users.md)
- [Uploads](/docs/uploads.md)
- [Validation](/docs/validation.md)
- [Goals](/docs/goals.md)
- [Statistics](/docs/statistics.md)
- [Downloads](/docs/downloads.md)

## ⚙️ Architecture

- **Main Backend:** Django + PostgreSQL
- **File Backend:** FastAPI + MongoDB (blob storage)
- **Task Queue:** Celery + Redis
- **Frontend:** React
- **Deployment:** Docker, Compose, Makefile-based workflow

## 📁 Folder Structure (Top Level)

- `backend-app/` — main Django app
- `frontend-app/` — React app
- `storage-app/` — FastAPI blob service
- `scripts/` — app handy tools
- `tests/` — global tests
- `nginx/`, `redis/` — infrastructure configs
- `Makefile` — common commands
- `docker-compose*.yml` — dev/test/prod setup

## 🚀 Getting Started

### Prerequisites

- Docker + Docker Compose installed
- `.env` file created from `.env.sample`

```bash
cp .env.sample .env
```

### Build & Run
```bash
make build  # build all services
make start  # start in prod mode
make dev    # start in dev mode
```
Full command list available in the Makefile section below.

## 🧪 Testing
Run with:
```bash
docker exec iss-test-back ./manage.py test          # Main Backend
docker exec iss-test-storage python3 src/test.py    # Storage Backend
docker exec iss-test-front npm test                 # Frontend
docker exec iss-tests flake8                        # Python linter
docker exec iss-test-front npm run lint             # JavaScript linter
docker exec iss-test-front npm run compile          # JavaScript ts compiler checker
```

## 🛠️ Makefile Commands

General
```bash
make build          # build all services
make start          # start in prod mode
make stop           # stop prod mode
make start-new      # rebuild and start services in prod mode
make restart        # stop and start in prod mode
```

Dev Mode
```bash
make dev            # start in dev mode
make dev-stop       # stop dev mode
make dev-new        # rebuild and start services in dev mode
make dev-restart    # stop and start in dev mode
```

Tests
```bash
make test           # rebuild and start services in test mode
make test-start     # start in test mode
make test-build     # build test mode
make test-stop      # stop test mode
make test-restart   # stop and start services in test mode
```

Utils
```bash
make dump-schema    # dump database schema
make dump-data      # dump database data
make dump-all       # dump database both schema and data
make init-admin     # create new superuser
```
