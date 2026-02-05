from fastapi import APIRouter, Request, HTTPException

from ..models.page import SlugCheckResponse
from ..services.slug_service import check_slug_availability, generate_suggestions
from ..services.rate_limiter import rate_limiter

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """
    Get the best-guess client IP.

    Prefer X-Forwarded-For (set by reverse proxies like nginx) and fall back to the direct client IP.
    This prevents many different users behind the same proxy from sharing a single rate limit bucket.
    """
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        # X-Forwarded-For can be a comma-separated list. The first value is the original client IP.
        ip = x_forwarded_for.split(",")[0].strip()
        if ip:
            return ip

    return request.client.host if request.client else "unknown"


@router.get("/check/{slug}", response_model=SlugCheckResponse)
async def check_slug(slug: str, request: Request):
    """Check if a slug is available."""
    # Rate limiting - use real client IP when behind proxies
    client_ip = get_client_ip(request)
    allowed, retry_after = await rate_limiter.check_slug_check(client_ip)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

    # Check availability
    available, reason = await check_slug_availability(slug)

    # Generate suggestions if not available
    suggestions = []
    if not available:
        suggestions = await generate_suggestions(slug)

    return SlugCheckResponse(
        slug=slug,
        available=available,
        reason=reason,
        suggestions=suggestions
    )


@router.get("/suggest")
async def suggest_slugs(base: str = "valentine", count: int = 5):
    """Generate slug suggestions based on a base word."""
    if count > 10:
        count = 10

    suggestions = await generate_suggestions(base, count)
    return {"suggestions": suggestions}
