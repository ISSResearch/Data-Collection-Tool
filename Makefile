start:
	docker compose up -d

start-b:
	docker compose up -d --build

stop:
	docker compose down

restart:
	make stop && make start

start-test:
	docker compose -f docker-compose.test.yml up -d --build

stop-test:
	docker compose -f docker-compose.test.yml down

restart-test:
	make stop-test && make start-test

appdb-dump-schema:
	docker exec iss-db pg_dump -U postgres -d iss_app_db --schema-only > app_dump_schema

appdb-dump-data:
	docker exec iss-db pg_dump -U postgres -d iss_app_db --data-only > app_dump_data

dump-database:
	make appdb-dump-schema && make appdb-dump-data
