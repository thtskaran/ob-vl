from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re

from ..config import MIN_SLUG_LENGTH, MAX_SLUG_LENGTH, SLUG_PATTERN


class PageCreate(BaseModel):
    slug: str = Field(..., min_length=MIN_SLUG_LENGTH, max_length=MAX_SLUG_LENGTH)
    title: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1, max_length=2000)
    sender_name: Optional[str] = Field(None, max_length=50)
    recipient_name: Optional[str] = Field(None, max_length=50)
    template_id: str = Field(default="classic")

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not re.match(SLUG_PATTERN, v):
            raise ValueError(
                "Slug must start and end with alphanumeric characters "
                "and can only contain letters, numbers, and hyphens"
            )
        return v


class PageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    message: Optional[str] = Field(None, min_length=1, max_length=2000)
    sender_name: Optional[str] = Field(None, max_length=50)
    recipient_name: Optional[str] = Field(None, max_length=50)
    template_id: Optional[str] = None


class PageResponse(BaseModel):
    id: int
    slug: str
    title: str
    message: str
    sender_name: Optional[str]
    recipient_name: Optional[str]
    template_id: str
    created_at: datetime
    view_count: int


class PageCreateResponse(BaseModel):
    page: PageResponse
    edit_token: str
    url: str


class PageJobResponse(BaseModel):
    """Response when page creation is queued."""
    job_id: str
    status: str = "queued"
    message: str = "Your page is being created. Please wait..."


class PageJobStatusResponse(BaseModel):
    """Response for job status polling."""
    job_id: str
    status: str  # queued, started, finished, failed
    result: Optional[PageCreateResponse] = None
    error: Optional[str] = None


class SlugCheckResponse(BaseModel):
    slug: str
    available: bool
    reason: Optional[str] = None
    suggestions: list[str] = []
