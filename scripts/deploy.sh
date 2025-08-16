#!/bin/bash

# Deployment script for timelapse-journal application
set -e

# Configuration
ENVIRONMENT=${1:-production}
DEPLOY_TYPE=${2:-docker}

echo "🚀 Starting deployment process..."
echo "📦 Environment: $ENVIRONMENT"
echo "🐳 Deployment type: $DEPLOY_TYPE"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if required environment files exist
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f "backend/.env.production" ]; then
        echo "❌ Error: backend/.env.production file not found"
        exit 1
    fi
    if [ ! -f "frontend/.env.production" ]; then
        echo "❌ Error: frontend/.env.production file not found"
        exit 1
    fi
fi

# Build the application
echo "🏗️  Building application..."
./scripts/build.sh $ENVIRONMENT

# Deploy based on type
if [ "$DEPLOY_TYPE" = "docker" ]; then
    echo "🐳 Deploying with Docker..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🏭 Starting production containers..."
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml build
        docker-compose -f docker-compose.prod.yml up -d
    else
        echo "🛠️  Starting development containers..."
        docker-compose down
        docker-compose build
        docker-compose up -d
    fi
    
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Health checks
    echo "🏥 Running health checks..."
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend health check passed"
    else
        echo "❌ Backend health check failed"
        exit 1
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend health check passed"
    else
        echo "❌ Frontend health check failed"
        exit 1
    fi

elif [ "$DEPLOY_TYPE" = "pm2" ]; then
    echo "⚡ Deploying with PM2..."
    
    # Start backend with PM2
    cd backend
    if [ "$ENVIRONMENT" = "production" ]; then
        pm2 start ecosystem.config.js --env production
    else
        pm2 start ecosystem.config.js
    fi
    cd ..
    
    # Start frontend
    cd frontend
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run start:prod &
    else
        npm run start &
    fi
    cd ..

else
    echo "❌ Unknown deployment type: $DEPLOY_TYPE"
    echo "Available types: docker, pm2"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Type: $DEPLOY_TYPE"
echo "  Frontend URL: http://localhost:3000"
echo "  Backend URL: http://localhost:5000"
echo "  Timestamp: $(date)"