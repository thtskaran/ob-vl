# Quick Start Guide

Get the Valentine's App running in under 5 minutes.

## Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### Steps

```bash
# 1. Clone repository (if not already)
cd /home/karan/Documents/projects/ob-vl

# 2. Install dependencies
npm install
cd apps/api && pip install -r requirements.txt && cd ../..
cd apps/web && npm install && cd ../..

# 3. Start Redis
docker-compose -f docker-compose.dev.yml up -d

# 4. Start API (Terminal 1)
cd apps/api
uvicorn app.main:app --reload --port 8000

# 5. Start Worker (Terminal 2)
cd apps/api
python -m app.worker

# 6. Start Web (Terminal 3)
cd apps/web
npm run dev

# 7. Open browser
# Visit: http://localhost:5173
```

## Production Deployment

### Prerequisites
- Ubuntu 20.04+ server
- Docker & Docker Compose
- Domain: special.obvix.cloud

### Steps

```bash
# 1. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit .env files:
nano apps/api/.env
# Set: ALLOWED_ORIGINS=https://special.obvix.cloud
# Set: FRONTEND_DOMAIN=https://special.obvix.cloud

nano apps/web/.env
# Set: VITE_API_URL=https://special.obvix.cloud
# Set: VITE_PUBLIC_URL=https://special.obvix.cloud

# 2. Build and start
docker-compose build
docker-compose up -d

# 3. Verify
docker-compose ps
curl http://localhost:8000/health

# 4. Check logs
docker-compose logs -f
```

## Common Commands

```bash
# Development
make dev              # Start dev environment
make install          # Install dependencies

# Production
make build            # Build Docker images
make start            # Start all services
make stop             # Stop all services
make logs             # View logs

# Maintenance
make status           # Check service status
make backup           # Backup database
make redis-cli        # Connect to Redis
make queue-status     # Check queue depth
```

## Verify Installation

```bash
# Run verification script
./verify.sh

# Should output: ✅ All checks passed! Implementation complete.
```

## Test API

```bash
# Health check
curl http://localhost:8000/health

# Get templates
curl http://localhost:8000/api/templates

# Check slug
curl http://localhost:8000/api/slugs/check/my-valentine

# Create page
curl -X POST http://localhost:8000/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-page",
    "title": "Happy Valentine'\''s Day",
    "message": "You are amazing!",
    "template_id": "classic"
  }'
```

## Architecture Overview

```
┌─────────────────┐
│   React + Vite  │  (Port 5173 dev / 80 prod)
│   + TailwindCSS │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Nginx (prod)   │  Proxy /api → API
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   FastAPI       │  (Port 8000)
│   + SQLite      │  4 uvicorn workers
└────┬────────────┘
     │
     ↓
┌─────────────────┐
│   Redis         │  (Port 6379)
│   3 DBs:        │  - DB 0: Rate limiting
│                 │  - DB 1: Cache
│                 │  - DB 2: Queue (RQ)
└────┬────────────┘
     │
     ↓
┌─────────────────┐
│   RQ Workers    │  (2 replicas)
│   Background    │  Process queued jobs
│   Jobs          │
└─────────────────┘
```

## Key Features

✅ **Redis Integration**
- Distributed rate limiting (10 pages/hour, 60 slug checks/min)
- Caching (slugs: 60s, templates: 24h)
- Background job queue

✅ **Hybrid Page Creation**
- Sync: <2s (95% of requests)
- Async: Queued for slow operations
- Automatic frontend polling

✅ **Error Handling**
- React error boundaries
- Graceful degradation
- User-friendly error messages

✅ **Production Ready**
- Docker orchestration
- Health checks
- Zero-downtime restarts
- Automatic SSL (with Let's Encrypt)

## Environment Variables

### API (.env)
```bash
REDIS_URL=redis://redis:6379
DATABASE_PATH=/data/valentine.db
ALLOWED_ORIGINS=https://special.obvix.cloud
FRONTEND_DOMAIN=https://special.obvix.cloud
RATE_LIMIT_PAGES_PER_HOUR=10
RATE_LIMIT_SLUG_CHECKS_PER_MINUTE=60
```

### Web (.env)
```bash
VITE_API_URL=https://special.obvix.cloud
VITE_PUBLIC_URL=https://special.obvix.cloud
VITE_APP_ENV=production
```

## Troubleshooting

### Redis Connection Failed
```bash
docker-compose ps redis
docker exec valentine-redis redis-cli ping
```

### API Not Starting
```bash
docker-compose logs api
ls -la data/
```

### Workers Not Processing
```bash
docker-compose logs worker
docker exec valentine-redis redis-cli -n 2 llen rq:queue:page_creation
```

### Rate Limit Testing
```bash
make test-rate-limit
# Should fail after 10 requests
```

## Next Steps

1. ✅ Verify all services running: `docker-compose ps`
2. ✅ Check health: `curl http://localhost:8000/health`
3. ✅ Test page creation in browser: `http://localhost:5173`
4. ✅ Monitor logs: `docker-compose logs -f`
5. ✅ Review documentation: `README.md`, `docs/API.md`, `docs/DEPLOYMENT.md`

## Resources

- **Full Documentation**: [README.md](README.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

**Need Help?**
- Check logs: `docker-compose logs -f`
- Run verification: `./verify.sh`
- Check service status: `make status`
