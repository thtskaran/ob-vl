"""
Redis-based rate limiter using sliding window algorithm.
"""
import hashlib
import time
from typing import Optional

from .redis_client import redis_client
from ..config import RATE_LIMIT_PAGES_PER_HOUR, RATE_LIMIT_SLUG_CHECKS_PER_MINUTE


class RedisRateLimiter:
    """Redis-based rate limiter with sliding window algorithm for distributed systems."""

    def _hash_ip(self, ip: str) -> str:
        """Hash IP address for privacy."""
        return hashlib.sha256(ip.encode()).hexdigest()[:16]

    async def check_rate_limit(
        self,
        ip: str,
        action_type: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, Optional[int]]:
        """
        Check if the request is within rate limits using Redis sorted sets.
        Returns (is_allowed, retry_after_seconds).

        Uses sliding window algorithm:
        - Key: ratelimit:{action_type}:{ip_hash}
        - Score: timestamp
        - Members: request_id (timestamp)
        """
        ip_hash = self._hash_ip(ip)
        key = f"ratelimit:{action_type}:{ip_hash}"
        now = time.time()
        window_start = now - window_seconds

        try:
            # Use pipeline for atomic operations
            pipe = redis_client.rate_limit.pipeline()

            # Remove old entries outside the window
            pipe.zremrangebyscore(key, 0, window_start)

            # Count current requests in window
            pipe.zcard(key)

            # Execute pipeline
            results = await pipe.execute()
            current_count = results[1]

            if current_count >= max_requests:
                # Get oldest timestamp in window to calculate retry_after
                oldest_members = await redis_client.rate_limit.zrange(
                    key, 0, 0, withscores=True
                )
                if oldest_members:
                    oldest_timestamp = oldest_members[0][1]
                    retry_after = int(oldest_timestamp + window_seconds - now) + 1
                    return False, max(1, retry_after)
                else:
                    return False, window_seconds

            # Add current request
            await redis_client.rate_limit.zadd(key, {str(now): now})

            # Set expiry (window + buffer for cleanup)
            await redis_client.rate_limit.expire(key, window_seconds + 60)

            return True, None

        except Exception as e:
            # Fallback to allowing request if Redis fails (fail open)
            print(f"Rate limiter error: {e}")
            return True, None

    async def check_page_creation(self, ip: str) -> tuple[bool, Optional[int]]:
        """Check rate limit for page creation (10/hour)."""
        return await self.check_rate_limit(
            ip,
            "page_create",
            RATE_LIMIT_PAGES_PER_HOUR,
            3600  # 1 hour
        )

    async def check_slug_check(self, ip: str) -> tuple[bool, Optional[int]]:
        """Check rate limit for slug availability checks (60/minute)."""
        return await self.check_rate_limit(
            ip,
            "slug_check",
            RATE_LIMIT_SLUG_CHECKS_PER_MINUTE,
            60  # 1 minute
        )


# Global rate limiter instance
rate_limiter = RedisRateLimiter()
