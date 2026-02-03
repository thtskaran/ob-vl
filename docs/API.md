# API Documentation

Complete API reference for the Valentine's Page Generator.

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.obvix.cloud/api
```

## Authentication

Most endpoints are public. Protected endpoints require an `X-Edit-Token` header.

## Rate Limits

- **Page Creation**: 10 requests per hour per IP
- **Slug Checks**: 60 requests per minute per IP

Rate limit headers:
- `Retry-After`: Seconds until rate limit resets (on 429 errors)

## Endpoints

### Pages

#### Create Page

```http
POST /api/pages
Content-Type: application/json
```

**Request Body:**
```json
{
  "slug": "my-valentine",
  "title": "Happy Valentine's Day!",
  "message": "You make my heart sing...",
  "sender_name": "John",
  "recipient_name": "Jane",
  "template_id": "classic"
}
```

**Response (Immediate):**
```json
{
  "page": {
    "id": 1,
    "slug": "my-valentine",
    "title": "Happy Valentine's Day!",
    "message": "You make my heart sing...",
    "sender_name": "John",
    "recipient_name": "Jane",
    "template_id": "classic",
    "created_at": "2024-02-14T12:00:00Z",
    "view_count": 0
  },
  "edit_token": "abc123...",
  "url": "https://special.obvix.cloud/my-valentine"
}
```

**Response (Queued):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "message": "Your page is being created. Please wait..."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid slug format or slug taken
- `429 Too Many Requests`: Rate limit exceeded

---

#### Get Job Status

```http
GET /api/pages/job/{job_id}
```

**Response (Processing):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "started"
}
```

**Response (Completed):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "finished",
  "result": {
    "page": { ... },
    "edit_token": "abc123...",
    "url": "https://special.obvix.cloud/my-valentine"
  }
}
```

**Response (Failed):**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "failed",
  "error": "Database error: ..."
}
```

---

#### Get Page

```http
GET /api/pages/{slug}
```

**Response:**
```json
{
  "id": 1,
  "slug": "my-valentine",
  "title": "Happy Valentine's Day!",
  "message": "You make my heart sing...",
  "sender_name": "John",
  "recipient_name": "Jane",
  "template_id": "classic",
  "created_at": "2024-02-14T12:00:00Z",
  "view_count": 42
}
```

**Notes:**
- Increments view count on each request
- Returns 404 if page not found or deleted

---

#### Update Page

```http
PATCH /api/pages/{slug}
Content-Type: application/json
X-Edit-Token: abc123...
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "message": "Updated message",
  "sender_name": "Johnny",
  "recipient_name": "Janet",
  "template_id": "modern"
}
```

**Response:**
```json
{
  "id": 1,
  "slug": "my-valentine",
  "title": "Updated Title",
  ...
}
```

**Error Responses:**
- `401 Unauthorized`: Missing edit token
- `403 Forbidden`: Invalid edit token
- `404 Not Found`: Page not found

---

#### Delete Page

```http
DELETE /api/pages/{slug}
X-Edit-Token: abc123...
```

**Response:**
```json
{
  "message": "Page deleted successfully"
}
```

**Notes:**
- Soft delete (sets `is_active = 0`)
- Page URL will return 404 after deletion

---

### Slugs

#### Check Slug Availability

```http
GET /api/slugs/check/{slug}
```

**Response (Available):**
```json
{
  "slug": "my-valentine",
  "available": true,
  "reason": null,
  "suggestions": []
}
```

**Response (Taken):**
```json
{
  "slug": "my-valentine",
  "available": false,
  "reason": "This slug is already taken",
  "suggestions": [
    "my-valentine-1",
    "my-valentine-2",
    "love-my-valentine"
  ]
}
```

**Response (Invalid):**
```json
{
  "slug": "ab",
  "available": false,
  "reason": "Slug must be at least 3 characters",
  "suggestions": []
}
```

**Caching:**
- Results cached for 60 seconds
- Cache invalidated when slug is used

---

#### Get Slug Suggestions

```http
GET /api/slugs/suggest?base=valentine&count=5
```

**Response:**
```json
{
  "suggestions": [
    "valentine-1",
    "valentine-2",
    "love-valentine",
    "my-valentine",
    "valentine-heart"
  ]
}
```

---

### Templates

#### List Templates

```http
GET /api/templates
```

**Response:**
```json
{
  "templates": [
    {
      "id": "classic",
      "name": "Classic Love",
      "description": "Timeless romantic design with elegant typography",
      "primary_color": "#e91e63",
      "secondary_color": "#fce4ec",
      "font": "Pacifico",
      "interactive": false
    },
    {
      "id": "proposal",
      "name": "Will You Be Mine?",
      "description": "Interactive proposal with playful Yes/No buttons",
      "primary_color": "#ec4899",
      "secondary_color": "#fdf2f8",
      "font": "Pacifico",
      "interactive": true
    }
  ]
}
```

**Caching:**
- Cached for 24 hours
- Refresh cache by restarting API

---

#### Get Template

```http
GET /api/templates/{template_id}
```

**Response:**
```json
{
  "id": "classic",
  "name": "Classic Love",
  "description": "Timeless romantic design with elegant typography",
  "primary_color": "#e91e63",
  "secondary_color": "#fce4ec",
  "font": "Pacifico",
  "interactive": false
}
```

---

### Health Check

#### Health Status

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing authentication
- `403 Forbidden`: Invalid authentication
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting Details

### Page Creation Limit

- **Limit**: 10 pages per hour
- **Window**: Sliding 3600 seconds
- **Key**: IP address (hashed)
- **Storage**: Redis DB 0

**Example Response:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 1847
Content-Type: application/json

{
  "detail": "Too many pages created. Please try again in 1847 seconds."
}
```

### Slug Check Limit

- **Limit**: 60 checks per minute
- **Window**: Sliding 60 seconds
- **Key**: IP address (hashed)
- **Storage**: Redis DB 0

---

## Caching Strategy

### Redis DB Layout

- **DB 0**: Rate limiting data
- **DB 1**: Cache data (slugs, templates)
- **DB 2**: Queue data (RQ jobs)

### Cache Keys

```
slug_available:{slug}     # TTL: 60s
templates:list            # TTL: 24h
```

### Cache Invalidation

- Slug cache: Invalidated on page creation
- Template cache: Manual (restart API)

---

## Queue System

### Job Lifecycle

1. **Queued**: Job added to Redis queue
2. **Started**: Worker picks up job
3. **Finished**: Job completed successfully
4. **Failed**: Job encountered error

### Job Polling

Frontend should poll `/api/pages/job/{job_id}` every 1 second until:
- Status is `finished` (success)
- Status is `failed` (error)
- Max 30 attempts reached (timeout)

---

## Data Models

### Page

```typescript
interface Page {
  id: number
  slug: string
  title: string
  message: string
  sender_name: string | null
  recipient_name: string | null
  template_id: string
  created_at: string  // ISO 8601
  view_count: number
}
```

### Template

```typescript
interface Template {
  id: string
  name: string
  description: string
  primary_color: string  // Hex color
  secondary_color: string
  font: string
  interactive: boolean
}
```

---

## Security

### IP Hashing

All IPs are hashed using SHA-256 before storage:
```python
sha256(ip.encode()).hexdigest()[:16]
```

### Edit Tokens

- Generated using `secrets.token_urlsafe(32)`
- 256-bit entropy
- Stored hashed in database
- Required for update/delete operations

### CORS

Configured origins (comma-separated):
```
ALLOWED_ORIGINS=https://special.obvix.cloud,https://app.example.com
```

---

## Example Workflows

### Create and View Page

```bash
# 1. Check slug
curl http://localhost:8000/api/slugs/check/my-valentine

# 2. Create page
curl -X POST http://localhost:8000/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-valentine",
    "title": "Happy Valentine'\''s Day!",
    "message": "You are amazing!",
    "template_id": "classic"
  }'

# 3. View page
curl http://localhost:8000/api/pages/my-valentine
```

### Update Page

```bash
curl -X PATCH http://localhost:8000/api/pages/my-valentine \
  -H "Content-Type: application/json" \
  -H "X-Edit-Token: YOUR_EDIT_TOKEN" \
  -d '{
    "title": "Updated Title"
  }'
```

### Handle Queued Creation

```javascript
const response = await fetch('/api/pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(pageData)
})

const result = await response.json()

if (result.job_id) {
  // Poll for completion
  while (true) {
    const status = await fetch(`/api/pages/job/${result.job_id}`)
    const jobData = await status.json()

    if (jobData.status === 'finished') {
      console.log('Page created:', jobData.result)
      break
    }

    if (jobData.status === 'failed') {
      console.error('Creation failed:', jobData.error)
      break
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
```

---

For deployment information, see [DEPLOYMENT.md](DEPLOYMENT.md).
