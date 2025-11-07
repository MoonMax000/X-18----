#!/bin/bash
set -e

echo "🔧 Creating task definition with Resend (no SSM secrets)..."

# Get DB password from SSM
DB_PASS=$(aws ssm get-parameter --name /tyriantrade/db/password --with-decryption --query 'Parameter.Value' --output text)
echo "✅ Retrieved DB password from SSM"

# Get current task definition
aws ecs describe-task-definition --task-definition tyriantrade-backend:112 --query 'taskDefinition' > /tmp/task-112.json

# Remove secrets and add as environment variables
cat /tmp/task-112.json | jq --arg dbpass "$DB_PASS" '
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
  .containerDefinitions[0].secrets = [] |
  .containerDefinitions[0].environment += [
    {"name": "DB_PASSWORD", "value": $dbpass},
    {"name": "EMAIL_PROVIDER", "value": "resend"},
    {"name": "RESEND_API_KEY", "value": "re_YEUF4847_PF1mdVzH7jbpRkxeuYT56kbH"},
    {"name": "RESEND_FROM_EMAIL", "value": "noreply@tyriantrade.com"}
  ] |
  .containerDefinitions[0].environment |= unique_by(.name)
' > /tmp/task-new.json

echo "📝 Task definition prepared"
echo ""
echo "🔍 Validating JSON..."
if ! jq empty /tmp/task-new.json 2>/dev/null; then
  echo "❌ Invalid JSON generated"
  exit 1
fi
echo "✅ JSON is valid"

echo ""
echo "📤 Registering new task definition..."
NEW_REV=$(aws ecs register-task-definition --cli-input-json file:///tmp/task-new.json --query 'taskDefinition.revision' --output text)

echo "✅ New task definition registered: tyriantrade-backend:$NEW_REV"
echo ""
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --task-definition tyriantrade-backend:$NEW_REV \
  --force-new-deployment \
  --query 'service.serviceName' > /dev/null

echo "✅ Service updated to revision $NEW_REV"
echo ""
echo "📊 Changes:"
echo "  - Removed SSM secrets (DB_PASSWORD now env var)"
echo "  - Added EMAIL_PROVIDER=resend"
echo "  - Added RESEND_API_KEY=re_YEUF4847..."
echo "  - Added RESEND_FROM_EMAIL=noreply@tyriantrade.com"
echo ""
echo "🔄 Deployment in progress..."
echo "Monitor: aws ecs describe-services --cluster tyriantrade-cluster --services tyriantrade-backend-service"
