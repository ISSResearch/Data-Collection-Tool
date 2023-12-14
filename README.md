# ISS Data Collection Tool

## Makefile convinience commands (**docker** and **.env** file are supposed to be set):
- start project:
`make start`
- stop project:
`make stop`
- restart project:
`make restart`
- start project with rebuild:
`make start-b`
- start tests:
`make start-test`
- stop tests:
`make stop-test`
- restart tests:
`make restart-test`
- dump main apps database (schema and data separately):
`make dump-database`

## Deployment

### 1. Install Docker

### 2. Create and fill **.env** file
For local development copying sample is enough:
`cp .env.sample .env`

### 2. Run Containers:
#### Main App:
Docker Compose file: docker-compose.yml

Docker files:
- Dockerfile.backend
- Dockerfile.frontend
- Dockerfile.storage

Command:
`docker-compose up -d --build`

## Testing
Docker Compose file: docker-compose.test.yml

Docker files:
- Dockerfile.tests
- Dockerfile.back-tmp

Command (rebuild is important):
`docker-compose -f docker-compose.test.yml up -d --build`

Available tests:
- Main Backend:
`docker exec iss-test-back ./manage.py test`
- Storage Backend:
`tdb`
- Frontend:
`docker exec iss-test-front npm test`
- Selenium Tests (browser emulation):
`docker exec iss-tests python3 test.py`
- Python linter (no output means the lint test is passed):
`docker exec iss-tests flake8`
- JavaScript linter:
`tbd`
