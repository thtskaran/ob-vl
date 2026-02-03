# Server Deployment Steps

Complete step-by-step guide to deploy on production server.

## Prerequisites Checklist

- [ ] Domain `special.obvix.cloud` pointing to your server IP
- [ ] Ubuntu 20.04+ server with sudo access
- [ ] Docker and Docker Compose installed on server
- [ ] Git installed on server
- [ ] Ports 22, 80, 443 accessible

---

## Step 1: Pull Code to Server

```bash
# SSH to your server
ssh user@your-server-ip

# Clone or pull the repository
cd /home/karan/Documents/projects
git clone <your-repo-url> ob-vl
# OR if already cloned:
cd ob-vl && git pull origin main

cd ob-vl
```

---

## Step 2: Configure Environment

```bash
# Create API environment file
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

**Set these values in `apps/api/.env`:**
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
# Create Web environment file
cp apps/web/.env.example apps/web/.env
nano apps/web/.env
```

**Set these values in `apps/web/.env`:**
```env
VITE_API_URL=https://special.obvix.cloud
VITE_PUBLIC_URL=https://special.obvix.cloud
VITE_APP_ENV=production
```

---

## Step 3: Deploy Docker Services

```bash
# Option A: Use deployment script (recommended)
chmod +x deploy-production.sh
./deploy-production.sh

# Option B: Manual deployment
docker compose build
docker compose up -d
docker compose ps
```

**Verify services are running:**
```bash
docker compose ps

# Should show:
# valentine-api     - Up (healthy)
# valentine-redis   - Up (healthy)
# valentine-web     - Up
# valentine-worker  - Up (2 instances)
```

**Test services:**
```bash
# Test Redis
docker exec valentine-redis redis-cli ping
# Expected: PONG

# Test API (through web container proxy)
curl http://localhost:3000/api/templates
# Expected: JSON with templates

# Test web
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

---

## Step 4: Install and Configure Nginx

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Copy the nginx configuration
sudo cp nginx-reverse-proxy.conf /etc/nginx/sites-available/special.obvix.cloud

# OR create it manually:
sudo nano /etc/nginx/sites-available/special.obvix.cloud
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name special.obvix.cloud;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/special.obvix.cloud /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

**Test Nginx:**
```bash
# Should return your app's HTML
curl http://special.obvix.cloud

# Test API endpoint
curl http://special.obvix.cloud/api/templates
```

---

## Step 5: Install SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d special.obvix.cloud \
  --email your-email@example.com \
  --agree-tos \
  --redirect \
  --non-interactive

# OR interactive mode:
sudo certbot --nginx -d special.obvix.cloud
# Follow prompts and choose option 2 (Redirect HTTP to HTTPS)
```

**Certbot will automatically:**
- Obtain SSL certificate from Let's Encrypt
- Update your Nginx configuration with SSL settings
- Set up HTTP to HTTPS redirect
- Configure automatic renewal

**Verify SSL:**
```bash
# Check certificate
sudo certbot certificates

# Test HTTPS
curl -I https://special.obvix.cloud
# Expected: HTTP/2 200

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 6: Configure Firewall

```bash
# Allow SSH (IMPORTANT - do first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status verbose

# Expected output:
# 22/tcp    ALLOW    Anywhere
# 80/tcp    ALLOW    Anywhere
# 443/tcp   ALLOW    Anywhere
```

---

## Step 7: Final Verification

```bash
# 1. Check all Docker services
docker compose ps
# All services should show "Up" or "Up (healthy)"

# 2. Test Redis
docker exec valentine-redis redis-cli ping
# Expected: PONG

# 3. Test API health
curl https://special.obvix.cloud/api/templates
# Expected: JSON response with templates

# 4. Test in browser
# Visit: https://special.obvix.cloud
# Should load the Valentine's app

# 5. Test page creation
# Create a test page through the web interface

# 6. Check SSL certificate
sudo certbot certificates
# Should show valid certificate for special.obvix.cloud

# 7. View logs
docker compose logs -f --tail=50
# Should show no errors

# 8. Check queue workers
docker compose logs worker
# Should show "Worker started, listening to queue: page_creation"
```

---

## Step 8: Set Up Monitoring (Optional but Recommended)

```bash
# Create backup script
mkdir -p ~/backups
cat > ~/backup-valentine.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
cd /home/karan/Documents/projects/ob-vl
docker cp valentine-api:/data/valentine.db $BACKUP_DIR/valentine_$DATE.db
find $BACKUP_DIR -name "valentine_*.db" -mtime +7 -delete
EOF

chmod +x ~/backup-valentine.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/backup-valentine.sh") | crontab -

# Create log rotation for Nginx
sudo tee /etc/logrotate.d/valentine << EOF
/var/log/nginx/special.obvix.cloud.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF
```

---

## Common Commands

```bash
# View application logs
docker compose logs -f

# View specific service logs
docker compose logs -f api
docker compose logs -f worker

# Check service status
docker compose ps

# Restart services
docker compose restart

# Stop services
docker compose down

# Start services
docker compose up -d

# View Nginx logs
sudo tail -f /var/log/nginx/special.obvix.cloud.access.log
sudo tail -f /var/log/nginx/special.obvix.cloud.error.log

# Reload Nginx (after config changes)
sudo nginx -t && sudo systemctl reload nginx

# Check Redis queue depth
docker exec valentine-redis redis-cli -n 2 llen rq:queue:page_creation

# Connect to Redis CLI
docker exec -it valentine-redis redis-cli

# View database
docker exec -it valentine-api sqlite3 /data/valentine.db "SELECT COUNT(*) FROM pages;"
```

---

## Troubleshooting

### Docker services won't start
```bash
docker compose logs
docker compose ps
sudo systemctl status docker
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
sudo certbot certificates
sudo certbot renew --dry-run
sudo certbot renew --force-renewal
```

### Can't access site
```bash
# Check if domain resolves
dig special.obvix.cloud

# Check if ports are open
sudo netstat -tulpn | grep -E ':(80|443|3000)'

# Check firewall
sudo ufw status

# Test locally
curl -v http://localhost:3000
curl -v https://special.obvix.cloud
```

### High memory usage
```bash
docker stats
docker compose restart redis
```

---

## Update / Redeploy

```bash
# Pull latest changes
cd /home/karan/Documents/projects/ob-vl
git pull origin main

# Rebuild and restart (zero downtime)
docker compose build
docker compose up -d --no-deps --build api worker web

# Check logs
docker compose logs -f --tail=50
```

---

## Success Checklist

After deployment, verify:

- [ ] https://special.obvix.cloud loads the app
- [ ] Can create a Valentine's page
- [ ] Page is accessible via custom URL
- [ ] API returns data at /api/templates
- [ ] SSL certificate is valid (green padlock in browser)
- [ ] All Docker services showing "Up" status
- [ ] No errors in Docker logs
- [ ] No errors in Nginx logs
- [ ] Firewall is enabled and configured
- [ ] Backup cron job is set up

---

## Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify services: `docker compose ps`
3. Test endpoints: `curl https://special.obvix.cloud/api/templates`
4. Check firewall: `sudo ufw status`
5. Review deployment guide: `docs/DEPLOYMENT.md`

---

**Deployment complete!** Your Valentine's App is live at https://special.obvix.cloud 🎉💕
