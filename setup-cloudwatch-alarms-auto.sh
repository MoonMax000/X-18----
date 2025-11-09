#!/bin/bash

# Auto Setup CloudWatch Alarms (без интерактивного ввода)
set -e

echo "🚨 Setting up CloudWatch Alarms..."
echo ""

# Configuration
CLUSTER_NAME="tyriantrade-cluster"
SERVICE_NAME="tyriantrade-backend-service"
REGION="us-east-1"
SNS_TOPIC_NAME="backend-alerts"

# Попробуем найти существующий SNS topic или создать новый
echo "📧 Checking for existing SNS topic..."
SNS_TOPIC_ARN=$(aws sns list-topics \
  --region $REGION \
  --query "Topics[?contains(TopicArn, '$SNS_TOPIC_NAME')].TopicArn" \
  --output text 2>/dev/null || true)

if [ -z "$SNS_TOPIC_ARN" ]; then
  echo "Creating new SNS topic..."
  SNS_TOPIC_ARN=$(aws sns create-topic \
    --name $SNS_TOPIC_NAME \
    --region $REGION \
    --query 'TopicArn' \
    --output text)
fi

echo "✅ SNS Topic: $SNS_TOPIC_ARN"
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
  --region $REGION \
  2>/dev/null && echo "✅ CPU alarm created" || echo "⚠️  CPU alarm already exists"

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
  --region $REGION \
  2>/dev/null && echo "✅ Memory alarm created" || echo "⚠️  Memory alarm already exists"

# 3. Task Count Alarm
echo "🔧 Creating Running Task Count alarm..."
aws cloudwatch put-metric-alarm \
  --alarm-name "${SERVICE_NAME}-task-count-low" \
  --alarm-description "Alert when running tasks drop below desired count" \
  --metric-name DesiredTaskCount \
  --namespace ECS/ContainerInsights \
  --statistic Average \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --dimensions Name=ServiceName,Value=$SERVICE_NAME Name=ClusterName,Value=$CLUSTER_NAME \
  --alarm-actions $SNS_TOPIC_ARN \
  --region $REGION \
  2>/dev/null && echo "✅ Task count alarm created" || echo "⚠️  Task count alarm already exists"

echo ""
echo "✅ CloudWatch alarms setup complete!"
echo ""
echo "📊 Created Alarms:"
echo "  1. ${SERVICE_NAME}-high-cpu"
echo "  2. ${SERVICE_NAME}-high-memory"
echo "  3. ${SERVICE_NAME}-task-count-low"
echo ""
echo "📧 SNS Topic: $SNS_TOPIC_ARN"
echo "   To receive email alerts, subscribe manually:"
echo "   aws sns subscribe --topic-arn $SNS_TOPIC_ARN --protocol email --notification-endpoint YOUR_EMAIL@example.com"
echo ""
echo "🔍 View alarms:"
echo "   https://console.aws.amazon.com/cloudwatch/home?region=${REGION}#alarmsV2:"
echo ""
