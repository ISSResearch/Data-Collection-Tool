# ISS Data Collection Tool

## Makefile convinience commands (**docker** and **.env** file are supposed to be set):
- star all apps:
`make start`
- stop all apps:
`make stop`
- restart all appps:
`make restart`
- start all apps and revuild them:
`make start-b`
- start tests:
`make start-test`
- stop tests:
`stop-test`
- restart tests:
`make restart-test`
- dump main apps database (schema and data separately):
`make dump-database`

## Deployment

### 1. Install Docker

### 2. Create and fill **.env** file:
`cp .env.sample .env`

#### For local development only one field required attention:
`APP_BACKEND_URL=http://127.0.0.1:8000`

The **domain** value needs to be external for storage container
"http://{**DOMAIN**}:8000"
**NOT** localhost or 127.0.0.1, its external ip
But the structure supposed to be the same

Linux ip example:
`hostname -I`

##### For prod deploy environment values meant to be set manually

### 2. Run Containers:
#### Main App:
Docker Compose file: docker-compose.yml

Docker files:
- Dockerfile.backend
- Dockerfile.frontend

Command:
`docker-compose up -d --build`

#### Storage App:
Docker Compose file: docker-composes.storage.yml

Docker files:
- Dockerfile.storage

Command:
`docker-compose -f docker-compose.storage.yml up -d --build`

## Testing
Docker Compose file: docker-compose.test.yml

Docker files:
- Dockerfile.tests
- Dockerfile.back-tmp

Command (rebuild is important):
`docker-compose -f docker-compose.test.yml up -d --build`

Available tests:
- Main App Backend:
`docker exec iss-test-back ./manage.py test`
- Frontend:
`docker exec iss-test-front npm test`
- Selenium Tests (browser emulation):
`docker exec iss-tests python3 test.py`
- Python linter (no output means the lint test is passed):
`docker exec iss-tests flake8`
- JavaScript linter:
`tbd`
