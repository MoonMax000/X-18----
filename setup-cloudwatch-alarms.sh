#!/bin/bash

# Setup CloudWatch Alarms for Production Monitoring
# This implements monitoring from Option 3 in BACKEND_OPTIMIZATION_GUIDE.md

set -e

echo "🚨 Setting up CloudWatch Alarms for Backend Monitoring..."
echo ""

# Configuration
CLUSTER_NAME="tyriantrade-cluster"
SERVICE_NAME="tyriantrade-backend-service"
ALB_ARN="arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:loadbalancer/app/tyriantrade-alb/YOUR_ALB_ID"
TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:us-east-1:YOUR_ACCOUNT_ID:targetgroup/tyriantrade-backend-tg/YOUR_TG_ID"
REGION="us-east-1"
SNS_TOPIC_NAME="backend-alerts"
EMAIL_ADDRESS="YOUR_EMAIL@example.com"  # Replace with your email

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $SERVICE_NAME"
echo "  SNS Topic: $SNS_TOPIC_NAME"
echo "  Alert Email: $EMAIL_ADDRESS"
echo ""

# Create SNS topic for alerts
echo "📧 Creating SNS topic for alerts..."
SNS_TOPIC_ARN=$(aws sns create-topic \
  --name $SNS_TOPIC_NAME \
  --region $REGION \
  --query 'TopicArn' \
  --output text 2>/dev/null || \
  aws sns list-topics \
    --region $REGION \
    --query "Topics[?contains(TopicArn, '$SNS_TOPIC_NAME')].TopicArn" \
    --output text)

if [ -z "$SNS_TOPIC_ARN" ]; then
  echo "❌ Failed to create or find SNS topic"
  exit 1
fi

echo "✅ SNS Topic: $SNS_TOPIC_ARN"

# Subscribe email to SNS topic
echo "📨 Subscribing email to SNS topic..."
aws sns subscribe \
  --topic-arn $SNS_TOPIC_ARN \
  --protocol email \
  --notification-endpoint $EMAIL_ADDRESS \
  --region $REGION \
  > /dev/null 2>&1 || true

echo "✅ Email subscription created (check your email for confirmation)"
echo ""

# 1. CPU Utilization Alarm
echo "🔧 Creating CPU Utilization alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-high-cpu" \
  --alarm-description "Alert when CPU usage exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION

echo "✅ CPU alarm created"

# 2. Memory Utilization Alarm
echo "🔧 Creating Memory Utilization alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-high-memory" \
  --alarm-description "Alert when memory usage exceeds 80%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION

echo "✅ Memory alarm created"

# 3. Task Count Alarm
echo "🔧 Creating Running Task Count alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-task-count-low" \
  --alarm-description "Alert when running tasks drop below desired count" \
  --metric-name RunningTaskCount \
  --namespace ECS/ContainerInsights \
  --statistic Average \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION

echo "✅ Task count alarm created"

# 4. ALB Target Health Alarm
echo "🔧 Creating ALB Healthy Host Count alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-unhealthy-targets" \
  --alarm-description "Alert when targets become unhealthy" \
  --metric-name UnHealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=TargetGroup,Value=$(echo $TARGET_GROUP_ARN | cut -d':' -f6) Name=LoadBalancer,Value=$(echo $ALB_ARN | cut -d':' -f6) \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION 2>/dev/null || echo "⚠️  Skipped (requires ALB ARN configuration)"

# 5. ALB 5XX Errors Alarm
echo "🔧 Creating ALB 5XX Errors alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-high-5xx-errors" \
  --alarm-description "Alert when 5XX errors exceed threshold" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=$(echo $ALB_ARN | cut -d':' -f6) \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION 2>/dev/null || echo "⚠️  Skipped (requires ALB ARN configuration)"

# 6. ALB Response Time Alarm
echo "🔧 Creating ALB Response Time alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-slow-response-time" \
  --alarm-description "Alert when response time exceeds 2 seconds" \
  --metric-name TargetResponseTime \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 2 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=LoadBalancer,Value=$(echo $ALB_ARN | cut -d':' -f6) \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION 2>/dev/null || echo "⚠️  Skipped (requires ALB ARN configuration)"

echo ""
echo "✅ CloudWatch alarms setup complete!"
echo ""
echo "📊 Created Alarms:"
echo "  1. ${SERVICE_NAME}-high-cpu"
echo "  2. ${SERVICE_NAME}-high-memory"
echo "  3. ${SERVICE_NAME}-task-count-low"
echo "  4. ${SERVICE_NAME}-unhealthy-targets (if ALB configured)"
echo "  5. ${SERVICE_NAME}-high-5xx-errors (if ALB configured)"
echo "  6. ${SERVICE_NAME}-slow-response-time (if ALB configured)"
echo ""
echo "📧 Alert Notifications:"
echo "  SNS Topic: $SNS_TOPIC_ARN"
echo "  Email: $EMAIL_ADDRESS (check inbox for confirmation)"
echo ""
echo "🔍 View alarms in AWS Console:"
echo "  https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#alarmsV2:"
echo ""
echo "Note: If you see warnings about ALB alarms, update the ALB_ARN and TARGET_GROUP_ARN"
echo "      variables in this script with your actual values."
echo ""
