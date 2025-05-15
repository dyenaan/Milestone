# Backend Service

This is the backend for the Milestone application, built with Express.js and Supabase integration.

## Features

- **Authentication**: User registration, login, and management using Supabase Auth
- **User Management**: User profiles and preferences
- **Jobs API**: Create, read, update, and delete jobs
- **Milestones API**: Track progress of jobs using milestones

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=https://okfjxtvdwdvflfjykpyi.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # JWT Configuration
   JWT_SECRET=your_strong_jwt_secret_key
   JWT_EXPIRATION=1d
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `POST /api/auth/aptos` - Login with Aptos wallet

### Users
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job
- `PATCH /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job

### Milestones
- `GET /api/jobs/:jobId/milestones` - Get all milestones for a job
- `POST /api/jobs/:jobId/milestones` - Create a new milestone
- `PATCH /api/jobs/milestones/:id` - Update a milestone
- `DELETE /api/jobs/milestones/:id` - Delete a milestone

## Database Schema

The application uses Supabase as the backend database with the following tables:

### Users (Supabase Auth)
Managed by Supabase Auth with extended metadata.

### Profiles
- `id` - User ID from Supabase Auth
- `full_name` - User's full name
- `bio` - User's bio
- `skills` - Array of user skills
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Jobs
- `id` - Primary key
- `title` - Job title
- `description` - Job description
- `budget` - Job budget
- `category` - Job category
- `deadline` - Job deadline
- `creator_id` - ID of the user who created the job
- `status` - Job status (open, in-progress, completed)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Milestones
- `id` - Primary key
- `job_id` - ID of the associated job
- `title` - Milestone title
- `description` - Milestone description
- `amount` - Payment amount for milestone
- `deadline` - Milestone deadline
- `status` - Milestone status (pending, completed, etc.)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp 