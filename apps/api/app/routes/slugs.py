from fastapi import APIRouter, Request, HTTPException

from ..models.page import SlugCheckResponse
from ..services.slug_service import check_slug_availability, generate_suggestions
from ..services.rate_limiter import rate_limiter

router = APIRouter()


@router.get("/check/{slug}", response_model=SlugCheckResponse)
async def check_slug(slug: str, request: Request):
    """Check if a slug is available."""
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
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
