#!/bin/bash

# Verification script for Valentine's App production implementation

echo "🔍 Verifying Valentine's App Implementation"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 (missing)"
        ((FAILED++))
    fi
}

echo "📁 Checking New Files..."
echo "------------------------"

# Backend files
check_file "apps/api/app/services/redis_client.py"
check_file "apps/api/app/services/cache_service.py"
check_dir "apps/api/app/tasks"
check_file "apps/api/app/tasks/__init__.py"
check_file "apps/api/app/tasks/page_tasks.py"
check_file "apps/api/app/worker.py"
check_file "apps/api/Dockerfile"
check_file "apps/api/.env.example"

# Frontend files
check_file "apps/web/Dockerfile"
check_file "apps/web/nginx.conf"
check_file "apps/web/.env.example"
check_file "apps/web/src/components/ErrorBoundary.tsx"

# Infrastructure
check_file "docker compose.yml"
check_file "docker compose.dev.yml"

# Documentation
check_file "README.md"
check_file "docs/API.md"
check_file "docs/DEPLOYMENT.md"
check_file "Makefile"

echo ""
echo "🔧 Checking Modified Files..."
echo "----------------------------"

check_file "apps/api/app/services/rate_limiter.py"
check_file "apps/api/app/main.py"
check_file "apps/api/app/config.py"
check_file "apps/api/app/routes/pages.py"
check_file "apps/api/app/routes/templates.py"
check_file "apps/api/app/services/slug_service.py"
check_file "apps/api/app/models/page.py"
check_file "apps/api/requirements.txt"
check_file "apps/web/src/App.tsx"
check_file "apps/web/src/lib/api.ts"
check_file "apps/web/src/hooks/useCreatePage.ts"

echo ""
echo "🔍 Checking Code Patterns..."
echo "---------------------------"

# Check for Redis client import
if grep -q "from .services.redis_client import redis_client" apps/api/app/main.py; then
    echo -e "${GREEN}✓${NC} Redis client imported in main.py"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Redis client not imported in main.py"
    ((FAILED++))
fi

# Check for Redis connection in lifespan
if grep -q "await redis_client.connect()" apps/api/app/main.py; then
    echo -e "${GREEN}✓${NC} Redis connection in lifespan"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Redis connection not in lifespan"
    ((FAILED++))
fi

# Check for ALLOWED_ORIGINS
if grep -q "ALLOWED_ORIGINS" apps/api/app/config.py; then
    echo -e "${GREEN}✓${NC} ALLOWED_ORIGINS configuration added"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} ALLOWED_ORIGINS not configured"
    ((FAILED++))
fi

# Check for ErrorBoundary import
if grep -q "import.*ErrorBoundary" apps/web/src/App.tsx; then
    echo -e "${GREEN}✓${NC} ErrorBoundary imported in App.tsx"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} ErrorBoundary not imported"
    ((FAILED++))
fi

# Check for job polling in API client
if grep -q "pollJobUntilComplete" apps/web/src/lib/api.ts; then
    echo -e "${GREEN}✓${NC} Job polling implemented in API client"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Job polling not implemented"
    ((FAILED++))
fi

# Check for multi-stage Dockerfile
if grep -q "FROM.*as production" apps/api/Dockerfile; then
    echo -e "${GREEN}✓${NC} Multi-stage Dockerfile for API"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Multi-stage Dockerfile not found"
    ((FAILED++))
fi

# Check for worker in docker compose
if grep -q "worker:" docker compose.yml; then
    echo -e "${GREEN}✓${NC} Worker service in docker compose"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Worker service not in docker compose"
    ((FAILED++))
fi

# Check for redis and rq in requirements
if grep -q "redis==5.0.1" apps/api/requirements.txt && grep -q "rq==1.15.1" apps/api/requirements.txt; then
    echo -e "${GREEN}✓${NC} Redis and RQ dependencies added"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Redis and RQ dependencies missing"
    ((FAILED++))
fi

echo ""
echo "📊 Summary"
echo "----------"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Implementation complete.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some checks failed. Please review.${NC}"
    exit 1
fi
