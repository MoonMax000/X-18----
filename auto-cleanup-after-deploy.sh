#!/bin/bash

echo "⏰ Waiting for deployment to complete..."
echo "=========================================="

# Wait for deployment
while true; do
    STATUS=$(gh run list --workflow="deploy.yml" --limit 1 --json status --jq '.[0].status')
    
    if [ "$STATUS" == "completed" ]; then
        echo "✅ Deployment completed!"
        break
    fi
    
    echo "⏳ Deploy status: $STATUS - waiting..."
    sleep 10
done

# Wait additional 2 minutes for ECS task to fully start
echo "⏳ Waiting for ECS task to start (2 minutes)..."
sleep 120

echo ""
echo "🗑️ Cleaning up production database..."
echo "========================================"

# You need admin credentials
# For now, just provide the curl command

echo "Run this command with your admin credentials:"
echo ""
echo 'curl -X DELETE https://api.tyriantrade.com/api/admin/cleanup/all \'
echo '  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"'
echo ""
echo "To get admin token, first login:"
echo 'curl -X POST https://api.tyriantrade.com/api/auth/login \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '\''{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_PASSWORD"}'\'''
echo ""
echo "Extract access_token from response and use it above"
