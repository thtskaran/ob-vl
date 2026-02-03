from pydantic import BaseModel


class Template(BaseModel):
    id: str
    name: str
    description: str
    primary_color: str
    secondary_color: str
    font: str
    interactive: bool = False


class TemplateListResponse(BaseModel):
    templates: list[Template]
