from pydantic import BaseModel


class Template(BaseModel):
    id: str
    name: str
    description: str
    primary_color: str
    secondary_color: str
    font: str


class TemplateListResponse(BaseModel):
    templates: list[Template]
