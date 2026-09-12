#!/bin/sh
set -e

echo "[DOMUS Backend] Aguardando banco de dados e aplicando migrações do Prisma..."
npx prisma migrate deploy --schema=./src/database/schema.prisma

echo "[DOMUS Backend] Inicializando servidor..."
exec "$@"
