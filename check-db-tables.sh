#!/bin/bash

# Проверка таблиц в базе данных

DB_HOST=$(grep '^DB_HOST=' custom-backend/.env | cut -d'=' -f2)
DB_PORT=$(grep '^DB_PORT=' custom-backend/.env | cut -d'=' -f2)
DB_NAME=$(grep '^DB_NAME=' custom-backend/.env | cut -d'=' -f2)
DB_USER=$(grep '^DB_USER=' custom-backend/.env | cut -d'=' -f2)
DB_PASSWORD=$(grep '^DB_PASSWORD=' custom-backend/.env | cut -d'=' -f2)

echo "📋 Список таблиц в базе данных:"
echo ""

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"
