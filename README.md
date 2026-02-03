# Valentine's Page Generator 💕

Create beautiful, shareable Valentine's pages with custom URLs. A production-ready application with Redis-based infrastructure, background job processing, and comprehensive error handling.

## Features

- **8 Stunning Templates**: 4 static and 4 interactive templates
- **Custom URLs**: Create pages at `special.obvix.cloud/your-name`
- **Redis Integration**: Distributed rate limiting and caching
- **Background Jobs**: Queue system for reliable page creation
- **Production Ready**: Full Docker orchestration with health checks
- **Error Boundaries**: Graceful error handling in React
- **Rate Limiting**: Distributed, persistent rate limiting across API restarts

## Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI (Python 3.11)
- **Database**: SQLite with WAL mode
- **Cache/Queue**: Redis (separate DB namespaces)
- **Workers**: RQ (Redis Queue) with 2 worker instances
- **Web Server**: Nginx (production)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start Redis (for development)
docker compose -f docker compose.dev.yml up -d

# Start API (Terminal 1)
cd apps/api
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Start worker (Terminal 2)
cd apps/api
source venv/bin/activate
python -m app.worker

# Start web (Terminal 3)
cd apps/web
npm install
npm run dev
```

Visit http://localhost:5173

### Production

```bash
# 1. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit .env files with your production values

# 2. Build and start all services
docker compose build
docker compose up -d

# 3. Verify services are running
docker compose ps
docker compose logs -f

# 4. Check health
curl http://localhost:8000/health
```

## Project Structure

```
ob-vl/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── db/            # Database layer
│   │   │   ├── models/        # Pydantic models
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── services/      # Business logic
│   │   │   ├── tasks/         # Background jobs
│   │   │   ├── config.py      # Configuration
│   │   │   ├── main.py        # FastAPI app
│   │   │   └── worker.py      # RQ worker
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── components/    # UI components
│       │   ├── hooks/         # React hooks
│       │   ├── lib/           # API client
│       │   ├── pages/         # Page components
│       │   └── templates/     # Valentine templates
│       ├── Dockerfile
│       └── nginx.conf
├── data/                       # SQLite database (persistent)
├── docs/                       # Documentation
├── docker compose.yml          # Production compose
├── docker compose.dev.yml      # Development compose
└── README.md
```

## Environment Variables

### API (.env)

```bash
# Environment
APP_ENV=production
DEBUG=false

# Database
DATABASE_PATH=/data/valentine.db

# Redis
REDIS_URL=redis://redis:6379

# CORS - Comma-separated origins
ALLOWED_ORIGINS=https://special.obvix.cloud
FRONTEND_DOMAIN=https://special.obvix.cloud

# Rate Limiting
RATE_LIMIT_PAGES_PER_HOUR=10
RATE_LIMIT_SLUG_CHECKS_PER_MINUTE=60
```

### Web (.env)

```bash
VITE_API_URL=https://api.obvix.cloud
VITE_PUBLIC_URL=https://special.obvix.cloud
VITE_APP_ENV=production
```

## API Endpoints

### Pages
- `POST /api/pages` - Create a new page (rate limited: 10/hour)
- `GET /api/pages/{slug}` - Get page by slug
- `GET /api/pages/job/{job_id}` - Poll job status for queued creation
- `PATCH /api/pages/{slug}` - Update page (requires edit token)
- `DELETE /api/pages/{slug}` - Delete page (requires edit token)

### Slugs
- `GET /api/slugs/check/{slug}` - Check availability (rate limited: 60/min)
- `GET /api/slugs/suggest` - Get slug suggestions

### Templates
- `GET /api/templates` - List all templates (cached 24h)
- `GET /api/templates/{id}` - Get specific template

## Key Features

### Hybrid Sync/Async Page Creation

Pages are created synchronously with a 2-second timeout. If the operation takes longer, it's automatically queued for background processing:

```typescript
// Frontend automatically handles both cases
const result = await createPage(data)
// Polls if queued, returns immediately if sync
```

### Redis-Based Rate Limiting

Distributed rate limiting using Redis sorted sets with sliding window algorithm:
- Persists across API restarts
- Works in distributed/multi-instance setups
- Automatic cleanup of old entries

### Caching Strategy

- **Slug Availability**: 60 seconds (frequent changes)
- **Templates**: 24 hours (rarely change)
- **Page Views**: No caching (always fresh)

### Error Boundaries

React error boundaries at multiple levels:
- Root level: Catches all unhandled errors
- Page level: Isolated error handling per route
- User-friendly fallback UI with reset option

## Docker Services

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Persistence**: AOF (Append-Only File)
- **Memory**: 256MB limit with LRU eviction
- **Health Check**: `redis-cli ping`

### API
- **Workers**: 4 uvicorn workers
- **Port**: 8000
- **Health Check**: `GET /health`
- **Dependencies**: Redis

### Worker
- **Replicas**: 2 instances
- **Queue**: `page_creation` on Redis DB 2
- **Timeout**: 30 seconds per job
- **Dependencies**: Redis

### Web
- **Server**: Nginx
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Caching**: 1 year for static assets
- **Proxy**: `/api` → `http://api:8000`

## Monitoring

```bash
# View logs
docker compose logs -f

# Check service status
docker compose ps

# Redis info
docker exec valentine-redis redis-cli info

# Check queue depth
docker exec valentine-redis redis-cli -n 2 llen rq:queue:page_creation

# API health
curl http://localhost:8000/health
```

## Development Commands

```bash
# Start dev environment
make dev

# Build production images
make build

# Start production
make start

# Stop all services
make stop

# View logs
make logs

# Restart services
make restart
```

## Testing Rate Limits

```bash
# Test page creation limit (should fail after 10 requests)
for i in {1..12}; do
  curl -X POST http://localhost:8000/api/pages \
    -H "Content-Type: application/json" \
    -d "{\"slug\":\"test-$i\",\"title\":\"Test\",\"message\":\"Test\",\"template_id\":\"classic\"}"
done

# Test slug check limit (should fail after 60 requests)
for i in {1..65}; do
  curl http://localhost:8000/api/slugs/check/test-$i
done
```

## Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment steps
- [SPEC.md](SPEC.md) - Original project specification

## Common Issues

### Redis Connection Failed
- Ensure Redis is running: `docker compose ps redis`
- Check Redis health: `docker exec valentine-redis redis-cli ping`

### Worker Not Processing Jobs
- Check worker logs: `docker compose logs worker`
- Verify Redis connection: `docker exec valentine-redis redis-cli -n 2 keys '*'`

### CORS Errors
- Check `ALLOWED_ORIGINS` in `.env`
- Ensure origins match exactly (including protocol)

### Page Creation Slow
- Check worker count: `docker compose ps worker`
- Monitor queue depth: `docker exec valentine-redis redis-cli -n 2 llen rq:queue:page_creation`
- Scale workers: Edit `docker compose.yml` `replicas` value

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for Valentine's Day
