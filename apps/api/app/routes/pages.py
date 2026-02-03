import secrets
import hashlib
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional

from ..models.page import PageCreate, PageUpdate, PageResponse, PageCreateResponse
from ..services.slug_service import check_slug_availability
from ..services.rate_limiter import rate_limiter
from ..db.database import execute_query, execute_insert, execute_update, get_db

router = APIRouter()


def generate_edit_token() -> str:
    """Generate a secure edit token."""
    return secrets.token_urlsafe(32)


def hash_ip(ip: str) -> str:
    """Hash IP for logging."""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


@router.post("", response_model=PageCreateResponse)
async def create_page(page: PageCreate, request: Request):
    """Create a new Valentine's page."""
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = rate_limiter.check_page_creation(client_ip)

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

    # Generate edit token
    edit_token = generate_edit_token()

    # Insert page
    page_id = await execute_insert(
        """
        INSERT INTO pages (slug, slug_lower, title, message, sender_name, recipient_name, template_id, edit_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            page.slug,
            page.slug.lower(),
            page.title,
            page.message,
            page.sender_name,
            page.recipient_name,
            page.template_id,
            edit_token,
        )
    )

    # Log creation
    await execute_insert(
        "INSERT INTO creation_logs (ip_hash, page_id) VALUES (?, ?)",
        (hash_ip(client_ip), page_id)
    )

    # Fetch created page
    pages = await execute_query(
        "SELECT * FROM pages WHERE id = ?",
        (page_id,)
    )

    if not pages:
        raise HTTPException(status_code=500, detail="Failed to create page")

    page_data = pages[0]
    page_response = PageResponse(
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

    return PageCreateResponse(
        page=page_response,
        edit_token=edit_token,
        url=f"https://special.obvix.io/{page.slug}"
    )


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
