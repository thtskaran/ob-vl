.PHONY: dev build start stop logs restart clean help install

help:
	@echo "Valentine's Page Generator - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev       - Start development environment (Redis + local servers)"
	@echo "  make install   - Install all dependencies"
	@echo ""
	@echo "Production:"
	@echo "  make build     - Build all Docker images"
	@echo "  make start     - Start all production services"
	@echo "  make stop      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make logs      - Follow logs from all services"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean     - Remove all containers, volumes, and images"
	@echo "  make backup    - Backup database"
	@echo "  make status    - Show service status"

# Development
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Redis started on port 6379"
	@echo ""
	@echo "Start API:    cd apps/api && uvicorn app.main:app --reload"
	@echo "Start Worker: cd apps/api && python -m app.worker"
	@echo "Start Web:    cd apps/web && npm run dev"

install:
	@echo "Installing dependencies..."
	cd apps/api && pip install -r requirements.txt
	cd apps/web && npm install
	@echo "Dependencies installed!"

# Production
build:
	@echo "Building production images..."
	docker-compose build
	@echo "Build complete!"

start:
	@echo "Starting production services..."
	docker-compose up -d
	@echo "Services started!"
	@make status

stop:
	@echo "Stopping all services..."
	docker-compose down
	@echo "Services stopped!"

restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "Services restarted!"

logs:
	docker-compose logs -f

# Maintenance
status:
	@echo "Service Status:"
	@docker-compose ps
	@echo ""
	@echo "Health Checks:"
	@docker exec valentine-redis redis-cli ping 2>/dev/null || echo "Redis: DOWN"
	@curl -s http://localhost:8000/health | grep -q "healthy" && echo "API: UP" || echo "API: DOWN"

clean:
	@echo "WARNING: This will remove all containers, volumes, and images!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi all; \
		echo "Cleaned!"; \
	fi

backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	@docker cp valentine-api:/data/valentine.db backups/valentine_$$(date +%Y%m%d_%H%M%S).db
	@echo "Backup created in backups/"

# Redis operations
redis-cli:
	docker exec -it valentine-redis redis-cli

redis-monitor:
	docker exec valentine-redis redis-cli monitor

redis-stats:
	@echo "Redis Statistics:"
	@docker exec valentine-redis redis-cli INFO stats

# Queue operations
queue-status:
	@echo "Queue Status:"
	@docker exec valentine-redis redis-cli -n 2 LLEN rq:queue:page_creation

queue-clear:
	@echo "Clearing queue..."
	@docker exec valentine-redis redis-cli -n 2 DEL rq:queue:page_creation
	@echo "Queue cleared!"

# Testing
test-api:
	@echo "Testing API endpoints..."
	@curl -s http://localhost:8000/health | grep -q "healthy" && echo "✓ Health check passed" || echo "✗ Health check failed"
	@curl -s http://localhost:8000/api/templates | grep -q "templates" && echo "✓ Templates endpoint passed" || echo "✗ Templates endpoint failed"

test-rate-limit:
	@echo "Testing rate limits (this will create test pages)..."
	@for i in {1..12}; do \
		echo -n "Request $$i: "; \
		curl -s -w "%{http_code}" -o /dev/null -X POST http://localhost:8000/api/pages \
			-H "Content-Type: application/json" \
			-d "{\"slug\":\"test-$$i\",\"title\":\"Test\",\"message\":\"Test\",\"template_id\":\"classic\"}"; \
		echo ""; \
	done
