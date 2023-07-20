FROM node:20.4-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src ./src
COPY public ./public