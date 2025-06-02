# ISS Data Collection Tool

## Makefile commands (**docker/docker-compose** and **.env file** are supposed to be set):

- build project:
  `make build`
- start project:
  `make start`
- stop project:
  `make stop`
- restart project:
  `make restart`
- start project with rebuild:
  `make start-new`
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
  `make dump-schema`
- dump main apps database data:
  `make dump-data`
- dump main apps database (schema and data separately):
  `make dump-all`

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
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`

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
- Selenium Tests (browser emulation) (turned off as for now):
  `docker exec iss-tests python3 test.py`
- Python linter:
  `docker exec iss-tests flake8`
- JavaScript linter:
  `docker exec iss-test-front npm run lint`
- JavaScript ts compiler checker:
  `docker exec iss-test-front npm run compile`
