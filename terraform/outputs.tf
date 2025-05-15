output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "ecs_service_url" {
  description = "The URL to access the ECS service"
  value       = "http://${aws_ecs_service.main.network_configuration[0].subnets[0]}:3000"
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "database_name" {
  description = "The name of the database"
  value       = aws_db_instance.postgres.db_name
}

output "database_username" {
  description = "The master username for the database"
  value       = aws_db_instance.postgres.username
  sensitive   = true
} 