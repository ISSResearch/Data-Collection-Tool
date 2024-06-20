prod:
	docker compose up -d

prod-new:
	docker compose up -d --build

prod-stop:
	docker compose down

prod-restart:
	make stop && make start

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

dev-new:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

dev-stop:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-restart:
	make stop-dev && make start-dev

test:
	docker compose -f docker-compose.test.yml up -d --build

test-stop:
	docker compose -f docker-compose.test.yml down

test-restart:
	make stop-test && make start-test

appdb-dump-schema:
	docker exec iss-main-db pg_dump -U postgres -d iss_app_db --schema-only > app_dump_schema

appdb-dump-data:
	docker exec iss-main-db pg_dump -U postgres -d iss_app_db --data-only > app_dump_data

dump-database:
	make appdb-dump-schema && make appdb-dump-data
