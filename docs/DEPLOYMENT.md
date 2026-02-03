# Deployment Guide

Step-by-step guide for deploying the Valentine's Page Generator to production.

## Prerequisites

### Server Requirements

- Ubuntu 20.04+ (or similar Linux distribution)
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- Docker 20.10+
- Docker Compose 2.0+
- Domain name: `special.obvix.cloud`
- SSL certificate (certbot recommended)

### Local Requirements

- Git
- SSH access to server
- Docker and Docker Compose installed locally (for testing)

---

## Step 1: Server Setup

### 1.1 Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
```

### 1.2 Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 1.3 Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Step 2: Clone Repository

```bash
# Clone repository
git clone https://github.com/yourusername/ob-vl.git
cd ob-vl

# Or if deploying from local:
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@server:/home/user/ob-vl/
```

---

## Step 3: Configure Environment

### 3.1 API Configuration

```bash
# Copy example
cp apps/api/.env.example apps/api/.env

# Edit configuration
nano apps/api/.env
```

**Production .env:**
```bash
# Environment
APP_ENV=production
DEBUG=false

# Database
DATABASE_PATH=/data/valentine.db

# Redis
REDIS_URL=redis://redis:6379

# CORS - YOUR ACTUAL DOMAIN
ALLOWED_ORIGINS=https://special.obvix.cloud
FRONTEND_DOMAIN=https://special.obvix.cloud

# Rate Limiting
RATE_LIMIT_PAGES_PER_HOUR=10
RATE_LIMIT_SLUG_CHECKS_PER_MINUTE=60

# Queue
QUEUE_WORKERS=2
```

### 3.2 Web Configuration

```bash
# Copy example
cp apps/web/.env.example apps/web/.env

# Edit configuration
nano apps/web/.env
```

**Production .env:**
```bash
VITE_API_URL=https://special.obvix.cloud
VITE_PUBLIC_URL=https://special.obvix.cloud
VITE_APP_ENV=production
```

### 3.3 Update docker-compose.yml

Edit `docker-compose.yml` to update build args:

```yaml
web:
  build:
    context: ./apps/web
    dockerfile: Dockerfile
    args:
      - VITE_API_URL=https://special.obvix.cloud
      - VITE_PUBLIC_URL=https://special.obvix.cloud
      - VITE_APP_ENV=production
```

---

## Step 4: SSL Certificates

### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop any running web server
docker-compose down

# Generate certificate
sudo certbot certonly --standalone -d special.obvix.cloud

# Certificates will be at:
# /etc/letsencrypt/live/special.obvix.cloud/fullchain.pem
# /etc/letsencrypt/live/special.obvix.cloud/privkey.pem
```

### Option B: Existing Certificates

Copy your certificates to:
```bash
/etc/ssl/certs/special.obvix.cloud.crt
/etc/ssl/private/special.obvix.cloud.key
```

### 4.1 Update Nginx Configuration

Edit `apps/web/nginx.conf` to add SSL:

```nginx
server {
    listen 80;
    server_name special.obvix.cloud;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name special.obvix.cloud;

    ssl_certificate /etc/letsencrypt/live/special.obvix.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/special.obvix.cloud/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}
```

### 4.2 Mount Certificates in Docker

Update `docker-compose.yml`:

```yaml
web:
  # ... existing config
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

---

## Step 5: Build and Deploy

### 5.1 Initial Build

```bash
# Build all images
docker-compose build

# This will take 5-10 minutes
```

### 5.2 Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# Check status
docker-compose ps
```

**Expected output:**
```
NAME                COMMAND                  STATUS              PORTS
valentine-api       "uvicorn app.main:..."   Up (healthy)        0.0.0.0:8000->8000/tcp
valentine-redis     "docker-entrypoint..."   Up (healthy)        0.0.0.0:6379->6379/tcp
valentine-web       "nginx -g 'daemon ..."   Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
valentine-worker-1  "python -m app.work..."  Up
valentine-worker-2  "python -m app.work..."  Up
```

### 5.3 Verify Deployment

```bash
# Check API health
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Check Redis
docker exec valentine-redis redis-cli ping
# Expected: PONG

# Check web server
curl -I http://localhost
# Expected: HTTP/1.1 301 Moved Permanently (redirects to HTTPS)

# Check logs
docker-compose logs -f
```

---

## Step 6: DNS Configuration

### 6.1 Add DNS Records

Add these records to your DNS provider:

```
Type    Name                Value               TTL
A       special.obvix.cloud  YOUR_SERVER_IP      300
AAAA    special.obvix.cloud  YOUR_SERVER_IPv6    300
```

### 6.2 Verify DNS

```bash
# Check DNS propagation
dig special.obvix.cloud

# Test from different location
curl -I https://special.obvix.cloud
```

---

## Step 7: Monitoring Setup

### 7.1 View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker

# Last 100 lines
docker-compose logs --tail=100 api
```

### 7.2 Check Service Status

```bash
# Service status
docker-compose ps

# Resource usage
docker stats

# API health
curl http://localhost:8000/health
```

### 7.3 Redis Monitoring

```bash
# Connect to Redis
docker exec -it valentine-redis redis-cli

# Inside Redis CLI:
INFO                           # Server info
DBSIZE                        # Key count
KEYS ratelimit:*              # Rate limit keys
KEYS slug_available:*         # Cached slugs
SELECT 2; LLEN rq:queue:page_creation  # Queue depth
```

---

## Step 8: Backup Strategy

### 8.1 Database Backup

```bash
# Create backup directory
mkdir -p /home/user/backups

# Backup script
cat > /home/user/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
docker exec valentine-api cp /data/valentine.db /data/valentine_$DATE.db
docker cp valentine-api:/data/valentine_$DATE.db $BACKUP_DIR/
find $BACKUP_DIR -name "valentine_*.db" -mtime +7 -delete
EOF

chmod +x /home/user/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/user/backup.sh") | crontab -
```

### 8.2 Restore from Backup

```bash
# Stop API
docker-compose stop api worker

# Restore database
docker cp /home/user/backups/valentine_20240214_020000.db valentine-api:/data/valentine.db

# Restart services
docker-compose start api worker
```

---

## Step 9: SSL Certificate Renewal

### 9.1 Automatic Renewal (Let's Encrypt)

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab (check daily)
(crontab -l 2>/dev/null; echo "0 0 * * * certbot renew --quiet && docker-compose restart web") | crontab -
```

### 9.2 Manual Renewal

```bash
# Renew certificate
sudo certbot renew

# Reload nginx
docker-compose restart web
```

---

## Step 10: Scaling

### 10.1 Scale Workers

Edit `docker-compose.yml`:

```yaml
worker:
  # ... existing config
  deploy:
    replicas: 4  # Increase from 2 to 4
```

Apply changes:
```bash
docker-compose up -d --scale worker=4
```

### 10.2 Scale API

Edit `apps/api/Dockerfile`:

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "8"]
# Increase from 4 to 8 workers
```

Rebuild and restart:
```bash
docker-compose build api
docker-compose up -d api
```

---

## Troubleshooting

### API Not Starting

```bash
# Check logs
docker-compose logs api

# Check database file permissions
ls -la data/

# Fix permissions
sudo chown -R 1000:1000 data/
```

### Redis Connection Failed

```bash
# Check Redis status
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test connection
docker exec valentine-redis redis-cli ping
```

### Workers Not Processing Jobs

```bash
# Check worker logs
docker-compose logs worker

# Check queue
docker exec valentine-redis redis-cli -n 2 llen rq:queue:page_creation

# Manually trigger a job
docker exec valentine-api python -c "
from redis import Redis
from rq import Queue
redis_conn = Redis.from_url('redis://redis:6379/2')
queue = Queue('page_creation', connection=redis_conn)
print(f'Jobs in queue: {len(queue)}')
"
```

### SSL Certificate Issues

```bash
# Check certificate validity
sudo certbot certificates

# Test SSL
curl -vI https://special.obvix.cloud

# Verify certificate files
sudo ls -la /etc/letsencrypt/live/special.obvix.cloud/
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart Redis (clears cache)
docker-compose restart redis

# Reduce Redis memory limit in docker-compose.yml
# command: redis-server --maxmemory 128mb
```

---

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose build

# Restart with zero downtime
docker-compose up -d --no-deps --build api worker web
```

### Clear Redis Cache

```bash
# Clear cache DB only (preserves rate limits and queue)
docker exec valentine-redis redis-cli -n 1 FLUSHDB
```

### Database Maintenance

```bash
# Compact database (reduce file size)
docker exec valentine-api python -c "
import sqlite3
conn = sqlite3.connect('/data/valentine.db')
conn.execute('VACUUM')
conn.close()
"

# Check database integrity
docker exec valentine-api python -c "
import sqlite3
conn = sqlite3.connect('/data/valentine.db')
result = conn.execute('PRAGMA integrity_check').fetchone()
print(result)
"
```

---

## Security Checklist

- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSL certificates installed and auto-renewing
- [ ] Environment files (.env) not committed to git
- [ ] Database file has proper permissions
- [ ] Redis has memory limits configured
- [ ] CORS origins properly restricted
- [ ] Regular backups scheduled
- [ ] System updates enabled
- [ ] Docker images regularly updated
- [ ] Logs rotated (Docker handles this automatically)

---

## Performance Tuning

### Nginx

Edit `apps/web/nginx.conf`:

```nginx
http {
    # Worker processes
    worker_processes auto;

    # Connection limits
    worker_connections 2048;

    # Buffer sizes
    client_body_buffer_size 16K;
    client_max_body_size 8m;

    # Timeouts
    keepalive_timeout 65;
    send_timeout 30;
}
```

### Redis

Edit `docker-compose.yml`:

```yaml
redis:
  command: >
    redis-server
    --maxmemory 512mb
    --maxmemory-policy allkeys-lru
    --maxmemory-samples 5
    --tcp-backlog 511
```

### SQLite

Already optimized with WAL mode. For better performance:

```python
# In apps/api/app/db/database.py
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=-64000;  # 64MB cache
PRAGMA temp_store=MEMORY;
```

---

## Monitoring with Prometheus (Optional)

```bash
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
  depends_on:
    - prometheus
```

---

For API documentation, see [API.md](API.md).
