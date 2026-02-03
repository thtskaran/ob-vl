from fastapi import APIRouter, HTTPException

from ..config import TEMPLATES
from ..models.template import Template, TemplateListResponse
from ..services.cache_service import cache_service

router = APIRouter()


@router.get("", response_model=TemplateListResponse)
async def list_templates():
    """List all available templates with 24h caching."""
    cache_key = "templates:list"

    # Try cache first
    cached = await cache_service.get(cache_key)
    if cached:
        return TemplateListResponse(**cached)

    # Build response
    templates = [Template(**t) for t in TEMPLATES.values()]
    response = TemplateListResponse(templates=templates)

    # Cache for 24 hours (templates rarely change)
    await cache_service.set(cache_key, response.dict(), ttl=86400)

    return response


@router.get("/{template_id}", response_model=Template)
async def get_template(template_id: str):
    """Get a specific template by ID."""
    if template_id not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")

    return Template(**TEMPLATES[template_id])
