#!/bin/bash

# This script helps set up the application with Supabase

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Milestone application with Supabase...${NC}"

# Check if .env files exist and create them if not
if [ ! -f "./backend/.env" ]; then
  echo -e "${GREEN}Creating backend .env file...${NC}"
  cat > ./backend/.env << EOL
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://okfjxtvdwdvflfjykpyi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMxODk5NiwiZXhwIjoyMDYyODk0OTk2fQ.628OGLFHx2UacTTIWNCOy7EIJDhKT7KXsXeR9sSPGgk

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_key
JWT_EXPIRATION=1d
EOL
  echo -e "${GREEN}Backend .env file created.${NC}"
else
  echo -e "${BLUE}Backend .env file already exists.${NC}"
fi

if [ ! -f "./frontend/.env" ]; then
  echo -e "${GREEN}Creating frontend .env file...${NC}"
  cat > ./frontend/.env << EOL
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=https://okfjxtvdwdvflfjykpyi.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZmp4dHZkd2R2ZmxmanlrcHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTg5OTYsImV4cCI6MjA2Mjg5NDk5Nn0.q4abAJmCbkECw-ch2N-V2tH0z454a5UOTq0iG5bZSxk
EOL
  echo -e "${GREEN}Frontend .env file created.${NC}"
else
  echo -e "${BLUE}Frontend .env file already exists.${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install

# Build backend
echo -e "${BLUE}Building backend...${NC}"
npm run build

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ../frontend
npm install

echo -e "${GREEN}Setup complete! You can now run:${NC}"
echo -e "${BLUE}./start-app.sh${NC}"
echo -e "${GREEN}to start the application.${NC}" 