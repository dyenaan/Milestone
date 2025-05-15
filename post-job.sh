#!/bin/bash

# Load environment variables from backend .env file
if [ -f "./backend/.env" ]; then
    export $(grep -v '^#' ./backend/.env | xargs)
    echo "Loaded environment variables from backend/.env"
else
    echo "Error: backend/.env file not found"
    exit 1
fi

# Ensure the required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env file"
    exit 1
fi

# Today's date in YYYY-MM-DD format
TODAY=$(date +%Y-%m-%d)

echo "Creating job in Supabase..."
echo "Using Supabase URL: $SUPABASE_URL"

# The job data
JOB_DATA='{
  "title": "Test Job from Terminal Bash Script",
  "description": "This job was created directly via bash script using curl",
  "budget": 150,
  "category": "Development",
  "deadline": "'$TODAY'",
  "status": "open",
  "creator_id": "846ceff6-c234-4d14-b473-f6bcd0dff3af"
}'

echo "Job data: $JOB_DATA"

# Make the API call to Supabase
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/jobs" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$JOB_DATA")

# Check if the response contains "id" which indicates success
if echo "$RESPONSE" | grep -q "id"; then
    echo "Job created successfully!"
    echo "Response: $RESPONSE"
else
    echo "Error creating job"
    echo "Response: $RESPONSE"
fi 