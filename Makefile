include .env

DOCKER_IMAGE := dc_app
DB_CONTAINER := iss-main-db
PROD_FILE := -f docker-compose.yml
DEV_FILE := -f docker-compose.dev.yml
TEST_FILE := -f docker-compose.test.yml

# MAIN
build:
	docker compose ${PROD_FILE} build --no-cache

start:
	docker compose ${PROD_FILE} up -d

stop:
	docker compose ${PROD_FILE} down

start-new: build start
restart: stop start

# DEV
dev:
	docker compose ${PROD_FILE} ${DEV_FILE} up -d

dev-stop:
	docker compose ${PROD_FILE} ${DEV_FILE} down

dev-new: build dev
dev-restart: dev-stop dev

# TEST
test-start:
	docker compose ${TEST_FILE} up -d

test-build:
	docker compose ${TEST_FILE} build --no-cache

test-stop:
	docker compose ${TEST_FILE} down

test: test-build test-start
test-restart: test-stop test

# UTILS
dump-schema:
	docker exec ${DB_CONTAINER} pg_dump -U postgres -d ${DB_APP_DB_NAME} --schema-only > dump_schema

dump-data:
	docker exec ${DB_CONTAINER} pg_dump -U postgres -d ${DB_APP_DB_NAME} --data-only > dump_data

dump-all: dump-schema dump-data

init-admin:
	docker exec -it iss-back ./manage.py createsuperuser
