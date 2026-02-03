"""
Redis-based caching service for frequently accessed data.
"""
import json
from typing import Optional, Any

from .redis_client import redis_client


class CacheService:
    """Caching service using Redis with JSON serialization."""

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        Returns None if key doesn't exist or is expired.
        """
        try:
            value = await redis_client.cache.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            print(f"Cache get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int):
        """
        Set value in cache with TTL in seconds.
        """
        try:
            serialized = json.dumps(value)
            await redis_client.cache.setex(key, ttl, serialized)
        except Exception as e:
            print(f"Cache set error for key {key}: {e}")

    async def delete(self, key: str):
        """
        Delete value from cache.
        """
        try:
            await redis_client.cache.delete(key)
        except Exception as e:
            print(f"Cache delete error for key {key}: {e}")

    async def exists(self, key: str) -> bool:
        """
        Check if key exists in cache.
        """
        try:
            return await redis_client.cache.exists(key) > 0
        except Exception as e:
            print(f"Cache exists error for key {key}: {e}")
            return False


# Global cache service instance
cache_service = CacheService()
