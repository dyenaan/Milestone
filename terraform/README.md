# Milestone AWS Terraform Configuration

This directory contains the Terraform configuration for deploying the Milestone platform on AWS.

## Resources Deployed

- VPC with public and private subnets
- PostgreSQL RDS instance in private subnets
- ECS Fargate cluster for running containerized backend
- Security groups, IAM roles, and other supporting resources

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) (v1.0.0+)
- AWS CLI configured with appropriate credentials
- Docker for building and pushing the container image

## Getting Started

1. **Initialize Terraform**

   ```bash
   terraform init
   ```

2. **Configure Variables**

   Create a `terraform.tfvars` file with your configuration:

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

   Key variables to customize:
   - `project_name`: Name prefix for AWS resources
   - `aws_region`: AWS region to deploy to
   - `db_password`: Secure password for PostgreSQL database
   - `ecr_repository_url`: URL of your ECR repository

3. **Deploy Infrastructure**

   ```bash
   terraform apply
   ```

   Review the plan and type `yes` to proceed with deployment.

4. **Access Outputs**

   After deployment completes, Terraform will output important information:
   - RDS endpoint
   - ECS service URL
   - VPC ID
   - Database name

## Container Deployment

Before applying Terraform, build and push your container image:

```bash
cd ../backend
docker build -t milestone-backend .
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REPOSITORY_URL
docker tag milestone-backend:latest $ECR_REPOSITORY_URL:latest
docker push $ECR_REPOSITORY_URL:latest
```

## Clean Up

To destroy all created resources:

```bash
terraform destroy
```

## Configuration Reference

| Variable                | Description                | Default        |
| ----------------------- | -------------------------- | -------------- |
| `project_name`          | Name prefix for resources  | `milestone`    |
| `aws_region`            | AWS region                 | `us-east-1`    |
| `db_instance_class`     | RDS instance type          | `db.t3.micro`  |
| `db_allocated_storage`  | RDS storage in GB          | `20`           |
| `db_name`               | Database name              | `milestone_db` |
| `db_username`           | Database username          | `postgres`     |
| `db_password`           | Database password          | (required)     |
| `ecr_repository_url`    | ECR repository URL         | (required)     |
| `task_cpu`              | ECS task CPU units         | `256`          |
| `task_memory`           | ECS task memory (MiB)      | `512`          |
| `service_desired_count` | ECS service instance count | `1`            |