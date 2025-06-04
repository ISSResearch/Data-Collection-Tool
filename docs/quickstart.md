# 🚀 Quickstart

This guide walks you through setting up and using ISS Data Collection Tool locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/ISSResearch/Data-Collection-Tool.git
cd data-collection-tool
cp .env.sample .env
make build
```

Make sure make, Docker, and Docker Compose are installed.
Edit the .env file to suit your environment before proceeding.

## 2. Start in Prod Mode

```bash
make start
```

This command starts all services in production mode using Docker Compose.
The project will be accessible at http://localhost:8000 (default port).

## 3. Create admin user
```bash
make init-admin
```

You must create a superuser before accessing the UI.
Only admin users can currently create new projects and manage roles/permissions.
More about that in [Users and Roles](/docs/users.md)

## ✅ Next Step
[Project](/docs/projects)
