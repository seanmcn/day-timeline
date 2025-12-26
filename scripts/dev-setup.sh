#!/bin/bash
set -e

echo "Setting up day-timeline development environment..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "Error: Node.js 20+ required (found v$NODE_VERSION)"
    exit 1
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Error: Docker daemon is not running"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build shared types
echo "Building shared types..."
npm run build:shared

# Start Docker services
echo "Starting LocalStack..."
docker compose up -d

# Wait for LocalStack to be healthy
echo "Waiting for LocalStack to initialize..."
MAX_ATTEMPTS=30
ATTEMPT=0

until curl -s http://localhost:4566/_localstack/health | grep -q '"s3"'; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "Error: LocalStack failed to start"
        exit 1
    fi
    echo "  Waiting... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done

echo "LocalStack is ready!"

# Get Cognito config
echo ""
echo "Fetching LocalStack configuration..."
if [ -f "./volume/config/aws-config.json" ]; then
    CONFIG=$(cat ./volume/config/aws-config.json)
    echo "User Pool ID: $(echo $CONFIG | grep -o '"userPoolId": "[^"]*"' | cut -d'"' -f4)"
    echo "Client ID: $(echo $CONFIG | grep -o '"clientId": "[^"]*"' | cut -d'"' -f4)"
fi

echo ""
echo "========================================"
echo "Development environment ready!"
echo "========================================"
echo ""
echo "Commands:"
echo "  npm run dev:frontend   - Start frontend (http://localhost:3000)"
echo "  npm run dev:backend    - Watch backend changes"
echo "  npm run docker:logs    - View LocalStack logs"
echo "  npm run docker:down    - Stop LocalStack"
echo ""
echo "Test user: test@example.com / TestPass123"
echo ""
