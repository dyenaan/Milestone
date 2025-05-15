#!/bin/bash

echo "Setting up Milestone Platform..."

# Check if we have access to Supabase CLI
if command -v supabase &> /dev/null; then
  echo "Supabase CLI detected, applying database setup..."
  
  # If you have Supabase running locally, uncomment this line
  # supabase db reset -f
  
  # Alternative: Use the Supabase dashboard to manually run supabase-setup.sql
  echo "IMPORTANT: For Supabase setup, please manually run supabase-setup.sql in the Supabase dashboard SQL editor"
  echo "This will create the necessary tables and permissions for the application to work correctly"
  echo ""
else
  echo "Supabase CLI not found. Please manually run supabase-setup.sql in the Supabase dashboard SQL editor"
  echo ""
fi

# Change to frontend directory
cd frontend

# Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Start the development server
echo "Starting frontend development server..."
npm run start 