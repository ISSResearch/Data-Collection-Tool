# ISS Data Collection Tool

## Makefile convinient commands (**docker/docker-compose** and **.env file** are supposed to be set):

- start project:
  `make prod`
- stop project:
  `make prod-stop`
- restart project:
  `make prod-restart`
- start project with rebuild:
  `make prod-new`
- start development project:
  `make dev`
- stop development project:
  `make dev-stop`
- restart development project:
  `make dev-restart`
- start project with rebuild:
  `make dev-new`
- start tests:
  `make test`
- stop tests:
  `make test-stop`
- restart tests:
  `make test-restart`
- dump main apps database schema:
  `make appdb-dump-schema`
- dump main apps database data:
  `make appdb-dump-data`
- dump main apps database (schema and data separately):
  `make dump-database`

## Prerequisites:

- **docker/docker-compose** installed
- create and fill **.env** file from sample

For local development copying sample is enough:
`cp .env.sample .env`

## Running Application

Docker Compose file: docker-compose.yml

Docker files:

- Dockerfile.backend
- Dockerfile.frontend
- Dockerfile.storage

Command:
`docker-compose up -d --build`

## Development

Docker Compose file: docker-compose.dev.yml

Docker files:

- Dockerfile.backend
- Dockerfile.frontend
- Dockerfile.storage

Command:
`docker-compose -f docker-compose.dev.yml up -d --build`

## Testing

Docker Compose file: docker-compose.test.yml

Docker files:

- Dockerfile.tests

Command (rebuild is important):
`docker-compose -f docker-compose.test.yml up -d --build`

Available tests:

- Main Backend:
  `docker exec iss-test-back ./manage.py test`
- Storage Backend:
  `docker exec iss-test-storage python3 src/test.py`
- Frontend:
  `docker exec iss-test-front npm test`
- Selenium Tests (browser emulation):
  `docker exec iss-tests python3 test.py`
- Python linter (no output means the lint test is passed):
  `docker exec iss-tests flake8`
- JavaScript linter:
  `docker exec iss-test-front npm run lint`
- JavaScript ts compiler checker:
  `docker exec iss-test-front npm run compile`
