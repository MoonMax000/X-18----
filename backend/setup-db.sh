#!/bin/bash

# Tyrian Trade Database Setup Script
# This script helps set up PostgreSQL for development

echo "🔧 Tyrian Trade - Database Setup"
echo "================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo ""
    echo "Please install PostgreSQL:"
    echo "  - macOS: brew install postgresql@15"
    echo "  - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running"
    echo ""
    echo "Start PostgreSQL:"
    echo "  - macOS: brew services start postgresql@15"
    echo "  - Ubuntu: sudo systemctl start postgresql"
    echo "  - Windows: Start via Services"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Database configuration
DB_NAME="tyrian_trade"
DB_USER="tyrian_user"
DB_PASSWORD="tyrian_password_2024"
DB_HOST="localhost"
DB_PORT="5432"

echo "📝 Creating database and user..."

# Create user and database
sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
    CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
  END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;

EOF

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
    echo ""
    echo "📝 Updating .env file..."
    
    # Update DATABASE_URL in .env
    NEW_DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    if [ -f .env ]; then
        # Update existing .env
        if grep -q "^DATABASE_URL=" .env; then
            sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" .env
            echo "✅ Updated DATABASE_URL in .env"
        else
            echo "DATABASE_URL=\"$NEW_DATABASE_URL\"" >> .env
            echo "✅ Added DATABASE_URL to .env"
        fi
    else
        cp .env.example .env
        sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" .env
        echo "✅ Created .env from .env.example"
    fi
    
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "Connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run db:push"
    echo "  2. Run: npm run dev"
else
    echo "❌ Database setup failed"
    exit 1
fi
