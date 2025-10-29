#!/bin/bash

# Debug script для проверки code_blocks в БД
echo "=== Debug Code Blocks в базе данных ==="
echo ""

# Проверяем посты в БД
echo "1. Проверка metadata в последних постах:"
echo "SELECT id, user_id, content, metadata FROM posts ORDER BY created_at DESC LIMIT 5;" | docker exec -i x-18-----postgres-1 psql -U postgres -d x18_dev

echo ""
echo "2. Проверка типа поля metadata:"
echo "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'metadata';" | docker exec -i x-18-----postgres-1 psql -U postgres -d x18_dev

echo ""
echo "3. Поиск постов с code_blocks в metadata:"
echo "SELECT id, user_id, content, metadata->'code_blocks' as code_blocks FROM posts WHERE metadata ? 'code_blocks' ORDER BY created_at DESC LIMIT 3;" | docker exec -i x-18-----postgres-1 psql -U postgres -d x18_dev

echo ""
echo "4. Сырой JSON metadata для постов с code_blocks:"
echo "SELECT id, metadata::text FROM posts WHERE metadata ? 'code_blocks' ORDER BY created_at DESC LIMIT 2;" | docker exec -i x-18-----postgres-1 psql -U postgres -d x18_dev

echo ""
echo "=== Конец проверки ==="
