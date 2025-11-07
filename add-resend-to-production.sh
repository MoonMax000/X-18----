#!/bin/bash

# Add Resend Email Configuration to AWS ECS Production Environment
# This script updates the ECS task definition with Resend API credentials

set -e

echo "📧 Adding Resend Email Configuration to AWS ECS..."

# Configuration
CLUSTER_NAME="tyriantrade-cluster"
SERVICE_NAME="tyriantrade-backend-service"
TASK_FAMILY="tyriantrade-backend"

# Resend Configuration
RESEND_API_KEY="re_YEUF4847_PF1mdVzH7jbpRkxeuYT56kbH"
RESEND_FROM_EMAIL="noreply@tyriantrade.com"
EMAIL_PROVIDER="resend"

echo "🔍 Fetching current task definition..."
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$TASK_FAMILY" \
  --query 'taskDefinition' \
  --output json)

echo "📝 Updating task definition with Resend configuration..."

# Extract current environment variables and add Resend configs
UPDATED_TASK_DEF=$(echo "$TASK_DEF" | jq --arg email_provider "$EMAIL_PROVIDER" \
  --arg resend_key "$RESEND_API_KEY" \
  --arg resend_from "$RESEND_FROM_EMAIL" '
  # Remove fields that cant be in register-task-definition
  del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) |
  
  # Update or add EMAIL_PROVIDER
  .containerDefinitions[0].environment |= 
    (map(select(.name == "EMAIL_PROVIDER")) | 
    if length > 0 then 
      map(if .name == "EMAIL_PROVIDER" then .value = $email_provider else . end)
    else 
      . + [{name: "EMAIL_PROVIDER", value: $email_provider}]
    end) |
  
  # Update or add RESEND_API_KEY
  .containerDefinitions[0].environment |=
    (map(select(.name == "RESEND_API_KEY")) |
    if length > 0 then
      map(if .name == "RESEND_API_KEY" then .value = $resend_key else . end)
    else
      . + [{name: "RESEND_API_KEY", value: $resend_key}]
    end) |
  
  # Update or add RESEND_FROM_EMAIL
  .containerDefinitions[0].environment |=
    (map(select(.name == "RESEND_FROM_EMAIL")) |
    if length > 0 then
      map(if .name == "RESEND_FROM_EMAIL" then .value = $resend_from else . end)
    else
      . + [{name: "RESEND_FROM_EMAIL", value: $resend_from}]
    end)
')

echo "📤 Registering new task definition..."
NEW_TASK_DEF=$(echo "$UPDATED_TASK_DEF" | aws ecs register-task-definition --cli-input-json file:///dev/stdin)
NEW_REVISION=$(echo "$NEW_TASK_DEF" | jq -r '.taskDefinition.revision')

echo "✅ New task definition registered: $TASK_FAMILY:$NEW_REVISION"

echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$SERVICE_NAME" \
  --task-definition "$TASK_FAMILY:$NEW_REVISION" \
  --force-new-deployment \
  > /dev/null

echo "✅ Service update initiated"

echo ""
echo "📊 Deployment Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Task Definition: $TASK_FAMILY:$NEW_REVISION"
echo "Email Provider: resend"
echo "From Email: $RESEND_FROM_EMAIL"
echo ""
echo "Added environment variables:"
echo "  - EMAIL_PROVIDER=resend"
echo "  - RESEND_API_KEY=re_YEUF4847... (masked)"
echo "  - RESEND_FROM_EMAIL=noreply@tyriantrade.com"
echo ""
echo "🔄 Deployment in progress..."
echo "Monitor with: watch-deployment.sh"
echo ""
echo "Expected logs in CloudWatch:"
echo "  ✅ Resend email client initialized (from: noreply@tyriantrade.com)"
echo "  📧 [EMAIL] Verification email sent successfully"
echo "  🔑 [PASSWORD_RESET] Email sent successfully"
echo "  🔐 [2FA] Email sent successfully"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
