start:
	docker compose up -d

start-new:
	docker compose up -d --build

stop:
	docker compose down

restart:
	make stop && make start

start-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

start-dev-new:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

stop-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

restart-dev:
	make stop-dev && make start-dev

start-test:
	docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --build

stop-test:
	docker compose -f docker-compose.yml -f docker-compose.test.yml down

restart-test:
	make stop-test && make start-test

appdb-dump-schema:
	docker exec iss-main-db pg_dump -U postgres -d iss_app_db --schema-only > app_dump_schema

appdb-dump-data:
	docker exec iss-main-db pg_dump -U postgres -d iss_app_db --data-only > app_dump_data

dump-database:
	make appdb-dump-schema && make appdb-dump-data
