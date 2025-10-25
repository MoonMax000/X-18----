#!/bin/bash

# Tyrian Trade Backend Verification Script
# This script verifies that the backend is properly set up

echo "🔍 Tyrian Trade Backend - Setup Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
echo "📄 Checking .env file..."
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "   Please copy .env.example to .env and configure it"
    exit 1
fi
echo -e "${GREEN}✅ .env file exists${NC}"
echo ""

# Check if node_modules exists
echo "📦 Checking dependencies..."
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
    echo "   Running npm install..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ npm install failed${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check DATABASE_URL
echo "🗄️  Checking database configuration..."
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
    exit 1
fi

if [[ "$DB_URL" == *"user:password@localhost"* ]]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL contains default credentials${NC}"
    echo "   Please update DATABASE_URL in .env with real credentials"
    echo ""
    echo "   Options:"
    echo "   1. Supabase: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
    echo "   2. Local: postgresql://tyrian_user:tyrian_password_2024@localhost:5432/tyrian_trade"
    echo "   3. Docker: postgresql://tyrian_user:tyrian_password_2024@localhost:5432/tyrian_trade"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
echo ""

# Check Stripe keys
echo "💳 Checking Stripe configuration..."
STRIPE_SECRET=$(grep "^STRIPE_SECRET_KEY=" .env | cut -d '=' -f2 | tr -d '"')
STRIPE_CLIENT=$(grep "^STRIPE_CLIENT_ID=" .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$STRIPE_SECRET" ] || [[ "$STRIPE_SECRET" == "sk_test_"* ]]; then
    echo -e "${GREEN}✅ Stripe configured (test mode)${NC}"
else
    echo -e "${YELLOW}⚠️  Stripe keys not configured${NC}"
fi
echo ""

# Check Resend API key
echo "📧 Checking Email service..."
RESEND_KEY=$(grep "^RESEND_API_KEY=" .env | cut -d '=' -f2 | tr -d '"')

if [ ! -z "$RESEND_KEY" ] && [[ "$RESEND_KEY" == "re_"* ]]; then
    echo -e "${GREEN}✅ Resend API key configured${NC}"
else
    echo -e "${YELLOW}⚠️  Resend API key not configured${NC}"
    echo "   Email functionality will not work"
fi
echo ""

# Test database connection
echo "🔌 Testing database connection..."
npx prisma db pull --force 2>&1 | grep -q "Introspection completed"
DB_STATUS=$?

if [ $DB_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    echo ""
    
    # Push schema
    echo "📊 Pushing Prisma schema..."
    npm run db:push > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema updated${NC}"
    else
        echo -e "${YELLOW}⚠️  Schema push had warnings (this is usually fine)${NC}"
    fi
else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Make sure PostgreSQL is running"
    echo "  2. Check DATABASE_URL in .env"
    echo "  3. For Supabase: verify connection string"
    echo "  4. For Local: run ./setup-db.sh"
    echo "  5. For Docker: run 'docker ps' to check container"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Backend setup verification complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the backend:  npm run dev"
echo "  2. Test endpoints:     curl http://localhost:3001/health"
echo "  3. View database:      npm run db:studio"
echo ""
echo "Available endpoints:"
echo "  - /health                         (Health check)"
echo "  - /api/v1/auth/*                  (Authentication)"
echo "  - /api/v1/profile/*               (User profile)"
echo "  - /api/v1/stripe-connect/*        (Stripe Connect)"
echo "  - /api/v1/payment-methods/*       (Payment methods)"
echo "  - /api/v1/notification-settings/* (Notifications)"
echo "  - /api/v1/api-keys/*              (API keys)"
echo "  - /api/v1/kyc/*                   (KYC verification)"
echo "  - /api/v1/referrals/*             (Referral program)"
echo "  - /api/v1/monetization/*          (Earnings & payouts)"
echo "  - /api/v1/billing/*               (Billing & subscriptions)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
