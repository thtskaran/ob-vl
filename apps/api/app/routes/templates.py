from fastapi import APIRouter, HTTPException

from ..config import TEMPLATES
from ..models.template import Template, TemplateListResponse

router = APIRouter()


@router.get("", response_model=TemplateListResponse)
async def list_templates():
    """List all available templates."""
    templates = [Template(**t) for t in TEMPLATES.values()]
    return TemplateListResponse(templates=templates)


@router.get("/{template_id}", response_model=Template)
async def get_template(template_id: str):
    """Get a specific template by ID."""
    if template_id not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")

    return Template(**TEMPLATES[template_id])
