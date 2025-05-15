# Milestone Platform with Supabase Integration

This document explains how the Milestone platform integrates with Supabase for backend services.

## Supabase Setup

### Project Configuration

- **Project URL**: https://okfjxtvdwdvflfjykpyi.supabase.co
- **Public Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODk5NiwiZXhwIjoyMDYyODk0OTk2fQ.628OGLFHx2UacTTIWNCOy7EIJDhKT7KXsXeR9sSPGgk

### Database Tables

The following tables should be created in your Supabase project:

#### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create policy to allow users to update their own profiles
CREATE POLICY "Users can view any profile" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

#### Jobs Table

```sql
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  category TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  creator_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create policies
CREATE POLICY "Anyone can view jobs" 
  ON jobs FOR SELECT 
  USING (true);

CREATE POLICY "Users can create jobs" 
  ON jobs FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own jobs" 
  ON jobs FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own jobs" 
  ON jobs FOR DELETE 
  USING (auth.uid() = creator_id);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
```

#### Milestones Table

```sql
CREATE TABLE milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create policies
CREATE POLICY "Anyone can view milestones" 
  ON milestones FOR SELECT 
  USING (true);

CREATE POLICY "Job creators can manage milestones" 
  ON milestones FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = milestones.job_id 
      AND jobs.creator_id = auth.uid()
    )
  );

-- Enable RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
```

#### Health Check Table

```sql
CREATE TABLE health_check (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'ok',
  message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status, message) 
VALUES ('ok', 'Supabase connection is healthy');

-- Create policy to allow anonymous reads
CREATE POLICY "Anyone can read health_check" 
  ON health_check FOR SELECT 
  USING (true);

-- Enable RLS
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;
```

### Authentication Setup

1. Configure Email Auth in Supabase Auth settings
2. Enable "Confirm email" option for security
3. Set up custom email templates if needed

### Backend Integration

The backend connects to Supabase using the following code:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://okfjxtvdwdvflfjykpyi.supabase.co';
const supabaseAnonKey = 'your_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Frontend Integration

The frontend connects directly to Supabase for authentication:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Environment Setup

Use the `setup-supabase.sh` script to configure your environment variables:

```bash
./setup-supabase.sh
```

This will create the necessary `.env` files with the correct configuration.

## Terraform Integration

The `terraform/supabase.tf` file contains variables that would be used for Supabase configuration. Note that Terraform doesn't have an official Supabase provider, so this is primarily for reference and documentation. 