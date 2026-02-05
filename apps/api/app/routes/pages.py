import secrets
import hashlib
import asyncio
import json
import os
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional, Union
from redis import Redis
from rq import Queue
from rq.job import Job

from ..models.page import (
    PageCreate, PageUpdate, PageResponse, PageCreateResponse,
    PageJobResponse, PageJobStatusResponse
)
from ..services.slug_service import check_slug_availability
from ..services.rate_limiter import rate_limiter
from ..services.cache_service import cache_service
from ..db.database import execute_query, execute_insert, execute_update, get_db
from ..tasks.page_tasks import create_page_async
from ..config import FRONTEND_DOMAIN

router = APIRouter()


def generate_edit_token() -> str:
    """Generate a secure edit token."""
    return secrets.token_urlsafe(32)


def hash_ip(ip: str) -> str:
    """Hash IP for logging."""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


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


@router.post("", response_model=Union[PageCreateResponse, PageJobResponse])
async def create_page(page: PageCreate, request: Request):
    """
    Create a new Valentine's page.
    Tries synchronous creation first (2s timeout), falls back to queue if slow.
    """
    # Rate limiting - use real client IP when behind proxies
    client_ip = get_client_ip(request)
    allowed, retry_after = await rate_limiter.check_page_creation(client_ip)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Too many pages created. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

    # Check slug availability
    available, reason = await check_slug_availability(page.slug)
    if not available:
        raise HTTPException(status_code=400, detail=reason)

    # Try synchronous creation with 2s timeout
    try:
        result = await asyncio.wait_for(
            create_page_async(
                slug=page.slug,
                title=page.title,
                message=page.message,
                template_id=page.template_id,
                client_ip=client_ip,
                sender_name=page.sender_name,
                recipient_name=page.recipient_name,
            ),
            timeout=2.0
        )

        if result["status"] == "success":
            # Invalidate cache
            await cache_service.delete(f"slug_available:{page.slug.lower()}")

            return PageCreateResponse(
                page=PageResponse(**result["page"]),
                edit_token=result["edit_token"],
                url=result["url"]
            )
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to create page"))

    except asyncio.TimeoutError:
        # Queue the job for background processing
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis_conn = Redis.from_url(f"{redis_url}/2")
        queue = Queue("page_creation", connection=redis_conn)

        job_data = json.dumps({
            "slug": page.slug,
            "title": page.title,
            "message": page.message,
            "template_id": page.template_id,
            "client_ip": client_ip,
            "sender_name": page.sender_name,
            "recipient_name": page.recipient_name,
        })

        job = queue.enqueue(
            "app.tasks.page_tasks.create_page_sync",
            job_data,
            job_timeout=30
        )

        return PageJobResponse(
            job_id=job.id,
            status="queued",
            message="Your page is being created. Please wait..."
        )


@router.get("/job/{job_id}", response_model=PageJobStatusResponse)
async def get_job_status(job_id: str):
    """Poll job status for queued page creation."""
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        redis_conn = Redis.from_url(f"{redis_url}/2")
        job = Job.fetch(job_id, connection=redis_conn)

        status_map = {
            "queued": "queued",
            "started": "started",
            "finished": "finished",
            "failed": "failed",
        }

        job_status = status_map.get(job.get_status(), "unknown")

        if job_status == "finished":
            result_json = job.result
            result = json.loads(result_json) if isinstance(result_json, str) else result_json

            if result["status"] == "success":
                return PageJobStatusResponse(
                    job_id=job_id,
                    status="finished",
                    result=PageCreateResponse(
                        page=PageResponse(**result["page"]),
                        edit_token=result["edit_token"],
                        url=result["url"]
                    )
                )
            else:
                return PageJobStatusResponse(
                    job_id=job_id,
                    status="failed",
                    error=result.get("error", "Unknown error")
                )
        elif job_status == "failed":
            return PageJobStatusResponse(
                job_id=job_id,
                status="failed",
                error=job.exc_info or "Job failed"
            )
        else:
            return PageJobStatusResponse(
                job_id=job_id,
                status=job_status
            )

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Job not found: {str(e)}")


@router.get("/{slug}", response_model=PageResponse)
async def get_page(slug: str):
    """Get a page by slug (public)."""
    pages = await execute_query(
        "SELECT * FROM pages WHERE slug_lower = ? AND is_active = 1",
        (slug.lower(),)
    )

    if not pages:
        raise HTTPException(status_code=404, detail="Page not found")

    page_data = pages[0]

    # Increment view count
    await execute_update(
        "UPDATE pages SET view_count = view_count + 1 WHERE id = ?",
        (page_data["id"],)
    )

    return PageResponse(
        id=page_data["id"],
        slug=page_data["slug"],
        title=page_data["title"],
        message=page_data["message"],
        sender_name=page_data["sender_name"],
        recipient_name=page_data["recipient_name"],
        template_id=page_data["template_id"],
        created_at=page_data["created_at"],
        view_count=page_data["view_count"] + 1,
    )


@router.patch("/{slug}", response_model=PageResponse)
async def update_page(
    slug: str,
    update: PageUpdate,
    x_edit_token: Optional[str] = Header(None)
):
    """Update a page (requires edit token)."""
    if not x_edit_token:
        raise HTTPException(status_code=401, detail="Edit token required")

    # Verify token
    pages = await execute_query(
        "SELECT * FROM pages WHERE slug_lower = ? AND is_active = 1",
        (slug.lower(),)
    )

    if not pages:
        raise HTTPException(status_code=404, detail="Page not found")

    page_data = pages[0]

    if page_data["edit_token"] != x_edit_token:
        raise HTTPException(status_code=403, detail="Invalid edit token")

    # Build update query
    updates = []
    params = []

    if update.title is not None:
        updates.append("title = ?")
        params.append(update.title)
    if update.message is not None:
        updates.append("message = ?")
        params.append(update.message)
    if update.sender_name is not None:
        updates.append("sender_name = ?")
        params.append(update.sender_name)
    if update.recipient_name is not None:
        updates.append("recipient_name = ?")
        params.append(update.recipient_name)
    if update.template_id is not None:
        updates.append("template_id = ?")
        params.append(update.template_id)

    if updates:
        params.append(page_data["id"])
        await execute_update(
            f"UPDATE pages SET {', '.join(updates)} WHERE id = ?",
            tuple(params)
        )

    # Fetch updated page
    pages = await execute_query(
        "SELECT * FROM pages WHERE id = ?",
        (page_data["id"],)
    )

    page_data = pages[0]

    return PageResponse(
        id=page_data["id"],
        slug=page_data["slug"],
        title=page_data["title"],
        message=page_data["message"],
        sender_name=page_data["sender_name"],
        recipient_name=page_data["recipient_name"],
        template_id=page_data["template_id"],
        created_at=page_data["created_at"],
        view_count=page_data["view_count"],
    )


@router.delete("/{slug}")
async def delete_page(
    slug: str,
    x_edit_token: Optional[str] = Header(None)
):
    """Delete (deactivate) a page (requires edit token)."""
    if not x_edit_token:
        raise HTTPException(status_code=401, detail="Edit token required")

    # Verify token
    pages = await execute_query(
        "SELECT * FROM pages WHERE slug_lower = ? AND is_active = 1",
        (slug.lower(),)
    )

    if not pages:
        raise HTTPException(status_code=404, detail="Page not found")

    page_data = pages[0]

    if page_data["edit_token"] != x_edit_token:
        raise HTTPException(status_code=403, detail="Invalid edit token")

    # Soft delete
    await execute_update(
        "UPDATE pages SET is_active = 0 WHERE id = ?",
        (page_data["id"],)
    )

    return {"message": "Page deleted successfully"}
