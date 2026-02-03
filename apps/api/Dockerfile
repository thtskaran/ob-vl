# Base stage with common dependencies
FROM python:3.11-slim as base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production API stage
FROM base as production

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /data && \
    chown -R appuser:appuser /app /data

USER appuser

# Copy application code
COPY --chown=appuser:appuser . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# Worker stage for background jobs
FROM base as worker

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /data && \
    chown -R appuser:appuser /app /data

USER appuser

# Copy application code
COPY --chown=appuser:appuser . .

CMD ["python", "-m", "app.worker"]
