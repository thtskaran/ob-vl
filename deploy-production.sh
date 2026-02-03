#!/bin/bash

# Production Deployment Script for Valentine's App
# Run this script on your production server after pulling the code

set -e  # Exit on any error

echo "🚀 Valentine's App - Production Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}❌ Please don't run this script as root${NC}"
    exit 1
fi

# Function to print steps
step() {
    echo -e "${BLUE}▶ $1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env files exist
step "Checking environment configuration..."
if [ ! -f "apps/api/.env" ]; then
    warning "API .env file not found. Creating from example..."
    cp apps/api/.env.example apps/api/.env
    error "Please edit apps/api/.env with your production values and run this script again."
    echo "Required values:"
    echo "  - ALLOWED_ORIGINS=https://special.obvix.cloud"
    echo "  - FRONTEND_DOMAIN=https://special.obvix.cloud"
    exit 1
fi

if [ ! -f "apps/web/.env" ]; then
    warning "Web .env file not found. Creating from example..."
    cp apps/web/.env.example apps/web/.env
    error "Please edit apps/web/.env with your production values and run this script again."
    echo "Required values:"
    echo "  - VITE_API_URL=https://special.obvix.cloud"
    echo "  - VITE_PUBLIC_URL=https://special.obvix.cloud"
    exit 1
fi

success "Environment files found"

# Create data directory
step "Creating data directory..."
mkdir -p data
success "Data directory ready"

# Build Docker images
step "Building Docker images (this may take 5-10 minutes)..."
docker-compose build
success "Docker images built successfully"

# Start services
step "Starting services..."
docker-compose up -d
success "Services started"

# Wait for services to be healthy
step "Waiting for services to be healthy..."
sleep 10

# Check service status
step "Checking service status..."
docker-compose ps

# Verify Redis
step "Testing Redis connection..."
if docker exec valentine-redis redis-cli ping > /dev/null 2>&1; then
    success "Redis is running"
else
    error "Redis is not responding"
    exit 1
fi

# Verify API
step "Testing API health..."
for i in {1..30}; do
    if curl -sf http://localhost:3000/api/templates > /dev/null; then
        success "API is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        error "API health check failed"
        echo "Check logs with: docker-compose logs api"
        exit 1
    fi
    sleep 2
done

# Verify web container
step "Testing web container..."
if curl -sf http://localhost:3000 > /dev/null; then
    success "Web container is serving content"
else
    error "Web container is not responding"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Docker services deployed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Install and configure Nginx reverse proxy"
echo "2. Obtain SSL certificate with Certbot"
echo "3. Configure firewall"
echo ""
echo "Run the following commands:"
echo ""
echo -e "${BLUE}# Install Nginx${NC}"
echo "sudo apt update && sudo apt install nginx -y"
echo ""
echo -e "${BLUE}# Create Nginx config${NC}"
echo "sudo nano /etc/nginx/sites-available/special.obvix.cloud"
echo ""
echo "Paste the configuration from: nginx-reverse-proxy.conf"
echo ""
echo -e "${BLUE}# Enable site${NC}"
echo "sudo ln -s /etc/nginx/sites-available/special.obvix.cloud /etc/nginx/sites-enabled/"
echo "sudo rm /etc/nginx/sites-enabled/default"
echo "sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo -e "${BLUE}# Install SSL${NC}"
echo "sudo apt install certbot python3-certbot-nginx -y"
echo "sudo certbot --nginx -d special.obvix.cloud --email your-email@example.com --agree-tos --redirect"
echo ""
echo -e "${BLUE}# Configure firewall${NC}"
echo "sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
echo "sudo ufw --force enable"
echo ""
echo "View logs: docker-compose logs -f"
echo "Check status: docker-compose ps"
