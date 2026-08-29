#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$repo_root/.env"

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file. Copy .env.example to .env and add your local values."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is required for the local MySQL and Redis services."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop is installed but is not running. Open Docker Desktop, wait until it is ready, then run this command again."
  exit 1
fi

set -a
source "$env_file"
set +a

: "${APP_MYSQL_DATABASE:=attraction_booking}"
: "${APP_MYSQL_USER:=attraction}"
: "${APP_MYSQL_PASSWORD:=attraction_dev}"
: "${APP_MYSQL_ROOT_PASSWORD:=attraction_root_dev}"
: "${APP_MYSQL_PORT:=3307}"
: "${APP_MYSQL_JDBC_URL:=jdbc:mysql://127.0.0.1:${APP_MYSQL_PORT}/${APP_MYSQL_DATABASE}}"

export APP_MYSQL_DATABASE
export APP_MYSQL_USER
export APP_MYSQL_PASSWORD
export APP_MYSQL_ROOT_PASSWORD
export APP_MYSQL_PORT
export APP_MYSQL_JDBC_URL
export SPRING_DATASOURCE_URL="$APP_MYSQL_JDBC_URL"
export SPRING_DATASOURCE_USERNAME="$APP_MYSQL_USER"
export SPRING_DATASOURCE_PASSWORD="$APP_MYSQL_PASSWORD"

docker compose -f "$repo_root/docker-compose.yml" up -d --wait mysql redis

cd "$repo_root/backend"
exec ./mvnw spring-boot:run
