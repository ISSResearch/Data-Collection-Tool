FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1

RUN apt-get update && pip install --no-cache-dir selenium

WORKDIR /tests

COPY . ./