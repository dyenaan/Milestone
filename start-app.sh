#!/bin/bash

# Set environment variables from config.env
export $(grep -v '^#' config.env | xargs)

# Start backend
echo "Starting backend server..."
cd backend
npm install
npm run build
PORT=5000 npm run dev &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID on port 5000"

# Wait for backend to initialize
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm install
export REACT_APP_API_URL="http://localhost:5000/api"
export DISABLE_ESLINT_PLUGIN=true
npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Function to handle script termination
function cleanup {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  
  # Only attempt to shutdown MongoDB if we started it
  if [[ "$OSTYPE" == "darwin"* && -n "$MONGO_PID" ]]; then
    echo "Stopping MongoDB..."
    kill $MONGO_PID
  fi
  
  exit
}

# Trap SIGINT and SIGTERM signals and call cleanup
trap cleanup SIGINT SIGTERM

# Keep script running
echo "Both servers are running. Press Ctrl+C to stop."
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000/api"
wait 