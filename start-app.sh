#!/bin/bash

# Set environment variables from config.env
export $(grep -v '^#' config.env | xargs)

# Start MongoDB if needed
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Checking MongoDB status on macOS..."
  if ! pgrep -x mongod > /dev/null; then
    echo "Starting MongoDB..."
    mongod --dbpath ~/data/db &
    sleep 5
  else
    echo "MongoDB is already running."
  fi
fi

# Start backend
echo "Starting backend server..."
cd backend
npm install
npm run start:dev &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to initialize
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm install
export REACT_APP_API_URL="http://localhost:3000"
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
echo "Backend: http://localhost:3001"
wait 