

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Provider Configuration

provider "aws" {
  region = "ap-southeast-2"
}


# Variable for SSH Key Pair (Best Practice)

variable "key_name" {
  description = "Name of the AWS Key Pair for SSH access"
  type        = string
  default     = "bloodlife-key" 
}


# 1. Security Group

resource "aws_security_group" "bloodlinker_sg" {
  name        = "bloodlinker-sg"
  description = "Allow SSH, HTTP, HTTPS, and Jenkins traffic"

  # SSH (Your IP only - in a real scenario, use a variable)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Change to your IP in production
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "bloodlinker-sg"
  }
}


# 2. Elastic IP

resource "aws_eip" "bloodlinker_ip" {
  domain = "vpc"

  tags = {
    Name = "bloodlinker-elastic-ip"
  }
}


# 3. EC2 Instance

resource "aws_instance" "bloodlinker_server" {
  ami           = "ami-020728ad6199d7fa0" 
  instance_type = "t3.micro"               
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.bloodlinker_sg.id]

  # 20GB Storage
  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  # User data script runs on first boot (installs Docker)
  user_data = <<-EOF
              #!/bin/bash
              sudo apt update
              sudo apt install -y docker.io docker-compose-v2
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "bloodlinker-server"
  }
}


# 4. Associate Elastic IP with EC2

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.bloodlinker_server.id
  allocation_id = aws_eip.bloodlinker_ip.id
}


# Outputs (Displays info after running terraform apply)

output "instance_public_ip" {
  description = "Public IP of the BloodLinker EC2 instance"
  value       = aws_eip.bloodlinker_ip.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.bloodlinker_ip.public_ip}"
}
