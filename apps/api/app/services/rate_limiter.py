import hashlib
import time
from collections import defaultdict
from typing import Optional

from ..config import RATE_LIMIT_PAGES_PER_HOUR, RATE_LIMIT_SLUG_CHECKS_PER_MINUTE


class InMemoryRateLimiter:
    """Simple in-memory rate limiter. Replace with Redis for production."""

    def __init__(self):
        # Structure: {ip_hash: [(timestamp, action_type), ...]}
        self._requests: dict[str, list[tuple[float, str]]] = defaultdict(list)

    def _hash_ip(self, ip: str) -> str:
        """Hash IP address for privacy."""
        return hashlib.sha256(ip.encode()).hexdigest()[:16]

    def _cleanup_old_entries(self, ip_hash: str, window_seconds: int):
        """Remove entries older than the window."""
        cutoff = time.time() - window_seconds
        self._requests[ip_hash] = [
            (ts, action) for ts, action in self._requests[ip_hash]
            if ts > cutoff
        ]

    def check_rate_limit(
        self,
        ip: str,
        action_type: str,
        max_requests: int,
        window_seconds: int
    ) -> tuple[bool, Optional[int]]:
        """
        Check if the request is within rate limits.
        Returns (is_allowed, retry_after_seconds).
        """
        ip_hash = self._hash_ip(ip)
        self._cleanup_old_entries(ip_hash, window_seconds)

        # Count requests of this action type
        action_count = sum(
            1 for _, action in self._requests[ip_hash]
            if action == action_type
        )

        if action_count >= max_requests:
            # Calculate retry after
            oldest_in_window = min(
                ts for ts, action in self._requests[ip_hash]
                if action == action_type
            )
            retry_after = int(oldest_in_window + window_seconds - time.time()) + 1
            return False, max(1, retry_after)

        # Record this request
        self._requests[ip_hash].append((time.time(), action_type))
        return True, None

    def check_page_creation(self, ip: str) -> tuple[bool, Optional[int]]:
        """Check rate limit for page creation (10/hour)."""
        return self.check_rate_limit(
            ip,
            "page_create",
            RATE_LIMIT_PAGES_PER_HOUR,
            3600  # 1 hour
        )

    def check_slug_check(self, ip: str) -> tuple[bool, Optional[int]]:
        """Check rate limit for slug availability checks (60/minute)."""
        return self.check_rate_limit(
            ip,
            "slug_check",
            RATE_LIMIT_SLUG_CHECKS_PER_MINUTE,
            60  # 1 minute
        )


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()
