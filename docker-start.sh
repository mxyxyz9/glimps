#!/bin/bash

echo "🐳 Starting Timelapse Journal with Docker..."

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Build and start the containers
echo "Building and starting containers..."
docker-compose up --build

echo "✅ Services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"