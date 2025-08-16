#!/bin/bash

# Build script for timelapse-journal application
set -e

echo "🚀 Starting build process..."

# Check if environment is specified
ENVIRONMENT=${1:-development}
echo "📦 Building for environment: $ENVIRONMENT"

# Install dependencies
echo "📥 Installing dependencies..."
npm run install:all

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test

# Build applications
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🏗️  Building for production..."
    npm run build:prod
else
    echo "🏗️  Building for development..."
    npm run build
fi

echo "✅ Build completed successfully!"

# Display build information
echo ""
echo "📊 Build Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Frontend: Built with Next.js"
echo "  Backend: Built with Node.js"
echo "  Timestamp: $(date)"