"""
Redis client service with separate DB namespaces for different concerns.
"""
from redis import asyncio as aioredis
from typing import Optional
import os


class RedisClient:
    """Centralized Redis connection manager with separate DB namespaces."""

    def __init__(self):
        self._rate_limit_client: Optional[aioredis.Redis] = None
        self._cache_client: Optional[aioredis.Redis] = None
        self._queue_client: Optional[aioredis.Redis] = None

    async def connect(self):
        """Establish connections to Redis with separate DB namespaces."""
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

        # DB 0: Rate limiting (needs fast access, can be volatile)
        self._rate_limit_client = await aioredis.from_url(
            f"{redis_url}/0",
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )

        # DB 1: Caching (TTL-based, can be volatile)
        self._cache_client = await aioredis.from_url(
            f"{redis_url}/1",
            encoding="utf-8",
            decode_responses=True,
            max_connections=20
        )

        # DB 2: Queue system (used by RQ)
        self._queue_client = await aioredis.from_url(
            f"{redis_url}/2",
            encoding="utf-8",
            decode_responses=True,
            max_connections=10
        )

    async def close(self):
        """Close all Redis connections."""
        if self._rate_limit_client:
            await self._rate_limit_client.close()
        if self._cache_client:
            await self._cache_client.close()
        if self._queue_client:
            await self._queue_client.close()

    @property
    def rate_limit(self) -> aioredis.Redis:
        """Redis client for rate limiting operations."""
        if not self._rate_limit_client:
            raise RuntimeError("Redis client not initialized. Call connect() first.")
        return self._rate_limit_client

    @property
    def cache(self) -> aioredis.Redis:
        """Redis client for caching operations."""
        if not self._cache_client:
            raise RuntimeError("Redis client not initialized. Call connect() first.")
        return self._cache_client

    @property
    def queue(self) -> aioredis.Redis:
        """Redis client for queue operations."""
        if not self._queue_client:
            raise RuntimeError("Redis client not initialized. Call connect() first.")
        return self._queue_client


# Global instance
redis_client = RedisClient()
