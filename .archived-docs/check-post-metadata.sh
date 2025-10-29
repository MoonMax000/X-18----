#!/bin/bash

echo "🔍 Checking Post Metadata in Database"
echo "====================================="

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="x18_backend"

echo ""
echo "📊 Recent posts with metadata:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -x << 'EOF'
SELECT 
    id,
    user_id,
    content,
    metadata,
    created_at
FROM posts 
ORDER BY created_at DESC 
LIMIT 3;
EOF

echo ""
echo "🔍 Checking metadata field structure:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
SELECT 
    id,
    jsonb_pretty(metadata) as metadata_formatted
FROM posts 
WHERE metadata IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 1;
EOF
