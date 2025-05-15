#!/bin/bash

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting the Freelancer Platform App...${NC}"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
  echo -e "${RED}Frontend directory not found!${NC}"
  exit 1
fi

# Navigate to frontend directory
cd frontend

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Node modules not found. Installing dependencies...${NC}"
  npm install
fi

# Start the frontend app
echo -e "${GREEN}Starting frontend server...${NC}"
npm run dev

# This script can be expanded to start the backend server as well
# For example:
# cd ../backend
# npm run dev &
# 
# Use & at the end to run in background

exit 0 