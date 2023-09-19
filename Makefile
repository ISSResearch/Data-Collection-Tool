start:
	docker compose -f docker-compose.yml -f docker-compose.storage.yml up -d

stop:
	docker compose -f docker-compose.yml -f docker-compose.storage.yml down

restart:
	make stop && make start

start-test:
	docker compose -f docker-compose.test.yml up -d --build

stop-test:
	docker compose -f docker-compose.test.yml down

restart-test:
	make stop-test && make start-test
