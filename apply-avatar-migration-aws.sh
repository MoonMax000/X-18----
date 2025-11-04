#!/bin/bash
# Apply avatar_url migration to AWS RDS
set -e

echo "🔧 Applying avatar_url migration to AWS RDS..."

PGPASSWORD='kn8wHxZT3P4yVmQs' psql \
  -h tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
  -U dbadmin \
  -d tyriantrade \
  -c "ALTER TABLE users ALTER COLUMN avatar_url TYPE VARCHAR(2000);" \
  -c "ALTER TABLE users ALTER COLUMN header_url TYPE VARCHAR(2000);" \
  -c "COMMENT ON COLUMN users.avatar_url IS 'User avatar URL (supports long Google profile URLs up to 2000 chars)';"

echo "✅ Migration applied successfully!"
echo ""
echo "Verifying..."
PGPASSWORD='kn8wHxZT3P4yVmQs' psql \
  -h tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
  -U dbadmin \
  -d tyriantrade \
  -c "\d users" | grep -E "(avatar_url|header_url)"

echo ""
echo "✅ Done! Now deploy with: ./deploy.sh backend"
