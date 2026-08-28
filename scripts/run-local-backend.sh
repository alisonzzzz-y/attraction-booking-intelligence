#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="$repo_root/.env"

if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file. Copy .env.example to .env and add your local values."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is required for the local PostgreSQL and Redis services."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop is installed but is not running. Open Docker Desktop, wait until it is ready, then run this command again."
  exit 1
fi

set -a
source "$env_file"
set +a

docker compose -f "$repo_root/docker-compose.yml" up -d postgres redis

cd "$repo_root/backend"
exec ./mvnw spring-boot:run
