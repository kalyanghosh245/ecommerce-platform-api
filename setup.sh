#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "============================================"
echo "   E-COMMERCE MICROSERVICES SETUP"
echo "   All 5 Services"
echo "============================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    exit 1
fi

log "Node.js found: $(node --version)"

# Install function
install_service() {
    local name=$1
    local path=$2
    shift 2
    local deps=("$@")
    
    log "[$name] Setting up..."
    cd "$path"
    
    log "  Installing dependencies..."
    npm install "${deps[@]}"
    
    log "  Installing dev dependencies..."
    npm install -D @nestjs/cli typescript @types/node ts-node
    
    log "  Linking shared library..."
    npm install ../../shared
    
    cd ../..
    log "[$name] Ready"
}

# Step 1: Shared
log "[1/6] Building Shared Library..."
cd shared
npm install
npm run build
cd ..

# Services
install_service "2/6] Product Service" "services/product-service" \
    @nestjs/common @nestjs/core @nestjs/platform-express \
    @nestjs/config @nestjs/typeorm typeorm pg \
    @nestjs/swagger swagger-ui-express \
    class-validator class-transformer \
    reflect-metadata rxjs @nestjs/axios axios

install_service "[3/6] Order Service" "services/order-service" \
    @nestjs/common @nestjs/core @nestjs/platform-express \
    @nestjs/config @nestjs/typeorm typeorm pg \
    @nestjs/axios axios \
    class-validator class-transformer \
    reflect-metadata rxjs

install_service "[4/6] Admin Service" "services/admin-service" \
    @nestjs/common @nestjs/core @nestjs/platform-express \
    @nestjs/config @nestjs/typeorm typeorm pg \
    @nestjs/swagger swagger-ui-express \
    class-validator class-transformer \
    reflect-metadata rxjs

install_service "[5/6] Customer Service" "services/customer-service" \
    @nestjs/common @nestjs/core @nestjs/platform-express \
    @nestjs/config @nestjs/typeorm typeorm pg \
    @nestjs/swagger swagger-ui-express \
    class-validator class-transformer bcrypt \
    reflect-metadata rxjs

install_service "[6/6] Notification Service" "services/notification-service" \
    @nestjs/common @nestjs/core @nestjs/platform-express \
    @nestjs/config @nestjs/typeorm typeorm pg \
    @nestjs/swagger swagger-ui-express \
    class-validator class-transformer \
    nodemailer twilio web-push \
    reflect-metadata rxjs

# Extra dev deps for notification service
cd services/notification-service
npm install -D @types/nodemailer @types/web-push
cd ../..

log "============================================"
log "SETUP COMPLETED!"
log "============================================"
log "Services:"
log "  - Product Service      :3003"
log "  - Order Service        :3004"
log "  - Admin Service        :3001"
log "  - Customer Service     :3002"
log "  - Notification Service :3005"