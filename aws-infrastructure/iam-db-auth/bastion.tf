# 🔐 SSM Bastion для подключения к RDS через IAM Auth (AWS Best Practices)
# ==============================================================================
# Версия с VPC Endpoints для SSM Session Manager

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ============================================================================
# Данные существующих ресурсов
# ============================================================================

data "aws_vpc" "main" {
  id = "vpc-00ce71b940a79b54a"
}

data "aws_subnet" "private" {
  id = "subnet-0929ee7b91593a2ea"
}

data "aws_security_group" "rds" {
  id = "sg-0c2b94f40cedb4d61"
}

# ============================================================================
# VPC Endpoints для SSM (КРИТИЧНО для работы Session Manager)
# ============================================================================

# Security Group для VPC Endpoints (без ingress правил для избежания цикла)
resource "aws_security_group" "vpc_endpoints" {
  name        = "tyriantrade-vpc-endpoints-sg"
  description = "Security group for VPC endpoints (SSM, EC2Messages, SSMMessages)"
  vpc_id      = data.aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name = "tyriantrade-vpc-endpoints-sg"
  }
}

# Ingress правило для VPC Endpoints (создается после обеих SG)
resource "aws_security_group_rule" "vpc_endpoints_from_bastion" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.vpc_endpoints.id
  source_security_group_id = aws_security_group.bastion.id
  description              = "HTTPS from bastion for SSM communication"
}

# VPC Endpoint для SSM
resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = data.aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.ssm"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [data.aws_subnet.private.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "tyriantrade-ssm-endpoint"
  }
}

# VPC Endpoint для SSM Messages (для Session Manager)
resource "aws_vpc_endpoint" "ssmmessages" {
  vpc_id              = data.aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.ssmmessages"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [data.aws_subnet.private.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "tyriantrade-ssmmessages-endpoint"
  }
}

# VPC Endpoint для EC2 Messages
resource "aws_vpc_endpoint" "ec2messages" {
  vpc_id              = data.aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.ec2messages"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [data.aws_subnet.private.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "tyriantrade-ec2messages-endpoint"
  }
}

# ============================================================================
# IAM роль для EC2 с SSM доступом
# ============================================================================

resource "aws_iam_role" "bastion" {
  name = "tyriantrade-bastion-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "tyriantrade-bastion-role"
  }
}

# Присоединяем управляемую политику для SSM
resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Политика для RDS IAM аутентификации
resource "aws_iam_policy" "rds_connect" {
  name        = "RDSIAMAuthPolicy-bastion"
  description = "Allows bastion to generate RDS IAM tokens"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "rds-db:connect"
        Resource = "arn:aws:rds-db:us-east-1:506675684508:dbuser:db-4JXFCQG3SJ3ENB3M3S3BA2SLUA/db_agent"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "bastion_rds" {
  role       = aws_iam_role.bastion.name
  policy_arn = aws_iam_policy.rds_connect.arn
}

# Instance Profile для EC2
resource "aws_iam_instance_profile" "bastion" {
  name = "tyriantrade-bastion-profile"
  role = aws_iam_role.bastion.name
}

# ============================================================================
# Security Group для bastion
# ============================================================================

resource "aws_security_group" "bastion" {
  name        = "tyriantrade-bastion-sg"
  description = "Security group for SSM bastion"
  vpc_id      = data.aws_vpc.main.id

  # Разрешаем исходящий трафик на RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [data.aws_security_group.rds.id]
    description     = "PostgreSQL to RDS"
  }

  tags = {
    Name = "tyriantrade-bastion-sg"
  }
}

# Egress правило для bastion к VPC Endpoints (создается после обеих SG)
resource "aws_security_group_rule" "bastion_to_vpc_endpoints" {
  type                     = "egress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = aws_security_group.bastion.id
  source_security_group_id = aws_security_group.vpc_endpoints.id
  description              = "HTTPS to VPC Endpoints for SSM"
}

# Добавляем правило в RDS SG для bastion (Security Group to Security Group)
resource "aws_security_group_rule" "rds_from_bastion" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = data.aws_security_group.rds.id
  source_security_group_id = aws_security_group.bastion.id
  description              = "PostgreSQL from bastion"
}

# ============================================================================
# AMI Selection (AWS Best Practice - через SSM Parameter)
# ============================================================================

data "aws_ssm_parameter" "amazon_linux_2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# ============================================================================
# User data для установки PostgreSQL client
# ============================================================================

locals {
  user_data = <<-EOF
    #!/bin/bash
    set -e
    
    # Логирование
    exec > >(tee /var/log/user-data.log)
    exec 2>&1
    
    echo "🚀 Starting bastion setup..."
    
    # Обновить систему
    echo "📦 Updating system packages..."
    dnf update -y
    
    # Установить PostgreSQL 16 client
    echo "🐘 Installing PostgreSQL 16 client..."
    dnf install -y postgresql16
    
    # Скачать RDS CA bundle
    echo "🔐 Downloading RDS CA bundle..."
    cd /home/ec2-user
    curl -o global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
    chown ec2-user:ec2-user global-bundle.pem
    
    # Создать helper скрипт для подключения
    echo "📝 Creating connection helper script..."
    cat > /home/ec2-user/connect-rds.sh <<'SCRIPT'
    #!/bin/bash
    # Генерируем IAM токен
    echo "🔑 Generating IAM authentication token..."
    TOKEN=$(aws rds generate-db-auth-token \
      --hostname tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
      --port 5432 \
      --username db_agent \
      --region us-east-1)
    
    echo "🔌 Connecting to RDS..."
    # Подключаемся к RDS
    PGPASSWORD="$TOKEN" psql \
      "host=tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
       port=5432 \
       dbname=tyriantrade \
       user=db_agent \
       sslmode=verify-full \
       sslrootcert=/home/ec2-user/global-bundle.pem"
    SCRIPT
    
    chmod +x /home/ec2-user/connect-rds.sh
    chown ec2-user:ec2-user /home/ec2-user/connect-rds.sh
    
    echo "✅ Bastion setup complete!"
    echo "📊 SSM Agent should be available in 1-2 minutes"
  EOF
}

# ============================================================================
# EC2 Instance для bastion
# ============================================================================

resource "aws_instance" "bastion" {
  ami                    = data.aws_ssm_parameter.amazon_linux_2023.value
  instance_type          = "t3.micro"
  subnet_id              = data.aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.bastion.id]
  iam_instance_profile   = aws_iam_instance_profile.bastion.name
  
  user_data = local.user_data

  # IMDSv2 (AWS Best Practice для безопасности)
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  # Зависимости - убедиться что VPC endpoints созданы до инстанса
  depends_on = [
    aws_vpc_endpoint.ssm,
    aws_vpc_endpoint.ssmmessages,
    aws_vpc_endpoint.ec2messages
  ]

  tags = {
    Name = "tyriantrade-bastion"
  }
}

# ============================================================================
# CloudWatch Log Group для Session Manager
# ============================================================================

resource "aws_cloudwatch_log_group" "session_manager" {
  name              = "/aws/ssm/session-manager/tyriantrade-bastion"
  retention_in_days = 7

  tags = {
    Name = "tyriantrade-bastion-sessions"
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "bastion_instance_id" {
  description = "ID bastion instance для SSM подключения"
  value       = aws_instance.bastion.id
}

output "vpc_endpoints_created" {
  description = "Созданные VPC Endpoints для SSM"
  value = {
    ssm          = aws_vpc_endpoint.ssm.id
    ssmmessages  = aws_vpc_endpoint.ssmmessages.id
    ec2messages  = aws_vpc_endpoint.ec2messages.id
  }
}

output "connect_command" {
  description = "Команда для подключения через SSM"
  value       = "aws ssm start-session --target ${aws_instance.bastion.id} --region us-east-1"
}

output "port_forward_command" {
  description = "Команда для port forwarding RDS на локальную машину"
  value       = "aws ssm start-session --target ${aws_instance.bastion.id} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{\"host\":[\"tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"5433\"]}' --region us-east-1"
}

output "instructions" {
  description = "Инструкции для использования"
  value = <<-EOT
    
    ╔══════════════════════════════════════════════════════════════════╗
    ║  🎉 Bastion Host создан с VPC Endpoints для SSM                  ║
    ╚══════════════════════════════════════════════════════════════════╝
    
    📋 Следующие шаги:
    
    1️⃣  Установить Session Manager Plugin (если еще не установлен):
       brew install session-manager-plugin
    
    2️⃣  Подождать 2-3 минуты для инициализации SSM Agent
    
    3️⃣  Проверить статус SSM Agent:
       aws ssm describe-instance-information \
         --filters "Key=InstanceIds,Values=${aws_instance.bastion.id}" \
         --region us-east-1
    
    4️⃣  Подключиться к bastion через SSM:
       aws ssm start-session \
         --target ${aws_instance.bastion.id} \
         --region us-east-1
    
    5️⃣  Или настроить port forwarding для TablePlus:
       aws ssm start-session \
         --target ${aws_instance.bastion.id} \
         --document-name AWS-StartPortForwardingSessionToRemoteHost \
         --parameters '{"host":["tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com"],"portNumber":["5432"],"localPortNumber":["5433"]}' \
         --region us-east-1
       
       Затем в TablePlus подключиться к localhost:5433
    
    💰 Стоимость VPC Endpoints: ~$7-10/месяц за 3 endpoints
    
  EOT
}
