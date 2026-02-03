"""
Background tasks for page creation.
"""
import json
import secrets
import hashlib
import asyncio
from typing import Dict, Any


def hash_ip(ip: str) -> str:
    """Hash IP for logging."""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


async def create_page_async(
    slug: str,
    title: str,
    message: str,
    template_id: str,
    client_ip: str,
    sender_name: str = None,
    recipient_name: str = None
) -> Dict[str, Any]:
    """
    Background task for page creation.
    Returns dict with status and either page data or error.
    """
    # Import here to avoid circular dependencies
    from ..services.slug_service import check_slug_availability
    from ..services.cache_service import cache_service
    from ..db.database import execute_insert, execute_query

    try:
        # Double-check slug availability (race condition protection)
        available, reason = await check_slug_availability(slug)
        if not available:
            return {"status": "error", "error": reason}

        # Generate edit token
        edit_token = secrets.token_urlsafe(32)

        # Insert page
        page_id = await execute_insert(
            """
            INSERT INTO pages (slug, slug_lower, title, message, sender_name, recipient_name, template_id, edit_token)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                slug,
                slug.lower(),
                title,
                message,
                sender_name,
                recipient_name,
                template_id,
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
            return {"status": "error", "error": "Failed to create page"}

        page_data = pages[0]

        # Invalidate slug availability cache
        await cache_service.delete(f"slug_available:{slug.lower()}")

        # Build response
        from ..config import FRONTEND_DOMAIN
        return {
            "status": "success",
            "page": {
                "id": page_data["id"],
                "slug": page_data["slug"],
                "title": page_data["title"],
                "message": page_data["message"],
                "sender_name": page_data["sender_name"],
                "recipient_name": page_data["recipient_name"],
                "template_id": page_data["template_id"],
                "created_at": page_data["created_at"],
                "view_count": page_data["view_count"],
            },
            "edit_token": edit_token,
            "url": f"{FRONTEND_DOMAIN}/{slug}"
        }

    except Exception as e:
        return {"status": "error", "error": str(e)}


def create_page_sync(job_data: str) -> str:
    """
    Synchronous wrapper for RQ worker.
    RQ requires synchronous functions, so we use asyncio.run.
    """
    data = json.loads(job_data)
    result = asyncio.run(create_page_async(**data))
    return json.dumps(result)
