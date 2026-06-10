#!/bin/sh
# entrypoint.sh — executado dentro do container do backend
# 1. Aplica migrations Prisma pendentes
# 2. Popula a BD se SEED_DB=true
# 3. Inicia o servidor Fastify

set -e

echo "⏳  A aplicar migrations da base de dados..."
npx prisma migrate deploy

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "🌱  A popular a base de dados (SEED_DB=true)..."
  node prisma/seed.js
fi

echo "🚀  A iniciar o servidor Fastify..."
exec node src/server.js
