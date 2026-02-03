# Server Deployment Steps

Quick deployment guide for production server (assumes Docker, Nginx, and Git are already installed).

## Prerequisites

- Ubuntu server with Docker & Docker Compose
- Nginx installed and running
- Domain `special.obvix.cloud` pointing to server IP
- Ports 80, 443 accessible

---

## Deployment

### 1. Clone/Pull Code

```bash
cd ~
git clone <your-repo-url> ob-vl
# OR if already cloned:
cd ob-vl && git pull origin main
```

### 2. Configure Environment

```bash
# Create API environment file
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Set these values:
```env
APP_ENV=production
DEBUG=false
DATABASE_PATH=/data/valentine.db
REDIS_URL=redis://redis:6379
ALLOWED_ORIGINS=https://special.obvix.cloud
FRONTEND_DOMAIN=https://special.obvix.cloud
RATE_LIMIT_PAGES_PER_HOUR=10
RATE_LIMIT_SLUG_CHECKS_PER_MINUTE=60
```

```bash
# Create web environment file
cp apps/web/.env.example apps/web/.env
nano apps/web/.env
```

Set these values:
```env
VITE_API_URL=https://special.obvix.cloud
VITE_PUBLIC_URL=https://special.obvix.cloud
VITE_APP_ENV=production
```

### 3. Create Data Directory

```bash
mkdir -p data
chown -R 1000:1000 data
chmod 755 data
```

### 4. Build and Start Services

```bash
docker compose build
docker compose up -d --scale worker=2
```

### 5. Verify Services

```bash
# Check all services are running
docker compose ps

# Test Redis
docker exec valentine-redis redis-cli ping
# Expected: PONG

# Test API health
curl http://localhost:3000/api/templates
# Expected: JSON with templates
```

### 6. Configure Nginx

```bash
# Copy nginx config
sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/special.obvix.cloud

# Enable site
sudo ln -s /etc/nginx/sites-available/special.obvix.cloud /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Install SSL Certificate

```bash
sudo certbot --nginx -d special.obvix.cloud
# Follow prompts, choose redirect HTTP to HTTPS
```

### 8. Final Verification

```bash
# Test HTTPS
curl -I https://special.obvix.cloud

# Test API
curl https://special.obvix.cloud/api/templates

# Check Docker services
docker compose ps

# View logs
docker compose logs -f --tail=50
```

---

## Common Commands

```bash
# View logs
docker compose logs -f
docker compose logs -f api
docker compose logs -f worker

# Check status
docker compose ps

# Restart services
docker compose restart

# Stop services
docker compose down

# Start services
docker compose up -d --scale worker=2

# Update application
git pull origin main
docker compose build
docker compose up -d --no-deps --build api worker web

# Backup database
docker cp valentine-api:/data/valentine.db ~/backups/valentine_$(date +%Y%m%d).db

# Check queue depth
docker exec valentine-redis redis-cli -n 2 llen rq:queue:page_creation

# Redis CLI
docker exec -it valentine-redis redis-cli
```

---

## Troubleshooting

**Services won't start:**
```bash
docker compose logs
docker compose ps
```

**502 Bad Gateway:**
```bash
# Check API is running
docker compose logs api

# Check Nginx config
sudo nginx -t
```

**Database errors:**
```bash
# Check data directory permissions
ls -la data/
chown -R 1000:1000 data
```

**SSL issues:**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## Success Checklist

- [ ] All Docker services show "Up" or "Up (healthy)"
- [ ] https://special.obvix.cloud loads the app
- [ ] Can create a Valentine's page
- [ ] SSL certificate is valid (green padlock)
- [ ] No errors in logs: `docker compose logs -f`

---

**Deployment complete!** 🎉💕
