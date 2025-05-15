variable "project_name" {
  description = "The name of the project, used for tagging resources"
  type        = string
  default     = "milestone"
}

variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "db_instance_class" {
  description = "The instance class for the RDS database"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "The allocated storage for the RDS database in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  default     = "milestone_db"
}

variable "db_username" {
  description = "The username for the database"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "The password for the database"
  type        = string
  sensitive   = true
}

variable "ecr_repository_url" {
  description = "The URL of the ECR repository"
  type        = string
}

variable "task_cpu" {
  description = "The number of CPU units for the ECS task"
  type        = string
  default     = "256"
}

variable "task_memory" {
  description = "The amount of memory for the ECS task in MiB"
  type        = string
  default     = "512"
}

variable "service_desired_count" {
  description = "The desired number of tasks for the ECS service"
  type        = number
  default     = 1
} 