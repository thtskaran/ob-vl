import re
import random
from typing import Optional

from ..config import (
    MIN_SLUG_LENGTH,
    MAX_SLUG_LENGTH,
    SLUG_PATTERN,
    RESERVED_SLUGS,
)
from ..db.database import execute_query
from .cache_service import cache_service


def validate_slug_format(slug: str) -> tuple[bool, Optional[str]]:
    """Validate slug format. Returns (is_valid, error_message)."""
    if len(slug) < MIN_SLUG_LENGTH:
        return False, f"Slug must be at least {MIN_SLUG_LENGTH} characters"

    if len(slug) > MAX_SLUG_LENGTH:
        return False, f"Slug must be at most {MAX_SLUG_LENGTH} characters"

    if not re.match(SLUG_PATTERN, slug):
        return False, "Slug must start and end with alphanumeric characters and can only contain letters, numbers, and hyphens"

    return True, None


def is_reserved_slug(slug: str) -> bool:
    """Check if slug is in the reserved list."""
    return slug.lower() in RESERVED_SLUGS


async def is_slug_taken(slug: str) -> bool:
    """Check if slug is already used in the database."""
    result = await execute_query(
        "SELECT 1 FROM pages WHERE slug_lower = ? AND is_active = 1",
        (slug.lower(),)
    )
    return len(result) > 0


async def check_slug_availability(slug: str) -> tuple[bool, Optional[str]]:
    """
    Check if a slug is available.
    Returns (is_available, reason_if_not_available).
    Uses caching to reduce database queries.
    """
    # Format validation (no caching needed)
    is_valid, error = validate_slug_format(slug)
    if not is_valid:
        return False, error

    # Reserved check (no caching needed)
    if is_reserved_slug(slug):
        return False, "This slug is reserved"

    # Check cache first
    cache_key = f"slug_available:{slug.lower()}"
    cached_result = await cache_service.get(cache_key)
    if cached_result is not None:
        # Cached result: {"available": bool, "reason": str or None}
        return cached_result["available"], cached_result.get("reason")

    # Database check
    is_taken = await is_slug_taken(slug)
    result = (not is_taken, "This slug is already taken" if is_taken else None)

    # Cache the result for 60 seconds
    await cache_service.set(
        cache_key,
        {"available": result[0], "reason": result[1]},
        ttl=60
    )

    return result


async def generate_suggestions(base_slug: str, count: int = 5) -> list[str]:
    """Generate alternative slug suggestions."""
    suggestions = []

    # Clean the base slug
    clean_base = re.sub(r"[^a-zA-Z0-9-]", "", base_slug)
    if len(clean_base) < MIN_SLUG_LENGTH:
        clean_base = "love"

    # Strategy 1: Append numbers
    for i in range(1, 100):
        candidate = f"{clean_base}-{i}"
        available, _ = await check_slug_availability(candidate)
        if available:
            suggestions.append(candidate)
            if len(suggestions) >= count:
                return suggestions

    # Strategy 2: Add romantic prefixes/suffixes
    romantic_words = ["love", "heart", "sweet", "dear", "my", "xoxo", "forever"]
    for word in romantic_words:
        for candidate in [f"{word}-{clean_base}", f"{clean_base}-{word}"]:
            if len(candidate) <= MAX_SLUG_LENGTH:
                available, _ = await check_slug_availability(candidate)
                if available:
                    suggestions.append(candidate)
                    if len(suggestions) >= count:
                        return suggestions

    # Strategy 3: Random suffixes
    while len(suggestions) < count:
        random_num = random.randint(100, 9999)
        candidate = f"{clean_base}-{random_num}"
        available, _ = await check_slug_availability(candidate)
        if available:
            suggestions.append(candidate)

    return suggestions[:count]
