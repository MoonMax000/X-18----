#!/bin/bash

echo "🔄 Applying migrations to local database..."
echo ""

# Navigate to custom-backend directory
cd custom-backend

# Run migrations
echo "Running Go migrations..."
go run cmd/server/main.go migrate

echo ""
echo "✅ Migrations applied!"
echo ""
echo "📝 Next steps:"
echo "1. Rebuild backend: cd custom-backend && go build -o server cmd/server/main.go"
echo "2. Restart backend: ./server (or go run cmd/server/main.go)"
echo "3. Reload frontend in browser (Ctrl+R)"
echo ""
echo "💡 To verify migrations were applied, check these tables exist:"
echo "   - subscriptions"
echo "   - post_purchases"
echo "   - Posts table should have 'access_level' and 'price_cents' columns"
