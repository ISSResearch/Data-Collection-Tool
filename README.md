# ISS Data Collection Tool

## Makefile convinient commands (**docker/docker-compose** and **.env file** are supposed to be set):

- start project:
  `make start`
- stop project:
  `make stop`
- restart project:
  `make restart`
- start project with rebuild:
  `make start-new`
- start development project:
  `make start-dev`
- stop development project:
  `make stop-dev`
- restart development project:
  `make restart-dev`
- start project with rebuild:
  `make start-dev-new`
- start tests:
  `make start-test`
- stop tests:
  `make stop-test`
- restart tests:
  `make restart-test`
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
