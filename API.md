# TaskFlow API Specification v2.0

This document outlines the comprehensive REST API endpoints for the TaskFlow web application built with Django REST Framework. It includes request/response shapes, authentication, status codes, and pagination patterns.

## Base Configuration

### Base URLs
- Production: `https://api.taskflow.example.com/api/v1/`
- Staging: `https://staging.api.taskflow.example.com/api/v1/`
- Development: `http://localhost:8000/api/v1/`

### Django Settings
- Framework: Django REST Framework (DRF)
- Authentication: JWT tokens via `djangorestframework-simplejwt`
- Permissions: Custom permission classes for user-specific data
- Serialization: DRF serializers with validation

### Authentication
- **Scheme**: Bearer token in Authorization header
- **Format**: `Authorization: Bearer <access_token>`
- **Token Type**: JWT (JSON Web Tokens)
- **Refresh**: Use refresh tokens to obtain new access tokens

### Error Response Format
All non-2xx responses follow Django REST Framework error format:
```json
{
  "error": {
    "code": "string",           // Machine-readable error code
    "message": "string",        // Human-readable error message
    "details": object|null,     // Optional validation errors or extra data
    "status": number            // HTTP status code
  }
}
```

### Pagination
Django REST Framework PageNumberPagination:
- **Query params**: `page` (default: 1), `page_size` (default: 20, max: 100)
- **Response format**:
```json
{
  "count": 125,                 // Total number of items
  "next": "url|null",          // Next page URL
  "previous": "url|null",       // Previous page URL
  "results": [...]             // Array of data objects
}
```

## Resource Models

### User Model (Django User extension)
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "date_joined": "ISO-8601",
  "last_login": "ISO-8601",
  "is_active": true,
  "profile": {
    "theme": "light" | "dark",
    "timezone": "string",
    "preferences": {
      "default_category": "uuid",
      "notifications_enabled": true
    }
  }
}
```

### Task Model
```json
{
  "id": "uuid",
  "title": "string",
  "category": "uuid",              // Foreign key to Category
  "priority": "Low" | "Medium" | "High",
  "due_date": "YYYY-MM-DD" | null,
  "notes": "string" | null,
  "completed": true | false,
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "completed_at": "ISO-8601" | null,
  "user": "uuid"                   // Foreign key to User (auto-populated)
}
```

### Category Model
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",               // Auto-generated from name
  "color": "#hexcode" | null,     // Optional category color
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "user": "uuid"                  // Foreign key to User
}
```

### Analytics Models
```json
// StatsOverview - Computed aggregation
{
  "total_tasks": "number",
  "completed_tasks": "number",  
  "overdue_tasks": "number",
  "today_tasks": "number",
  "completion_rate": "number"     // Percentage (0-100)
}

// Streak - Computed from task completion history
{
  "current_streak": "number",     // Consecutive days with completions
  "longest_streak": "number",
  "last_completion_date": "YYYY-MM-DD" | null
}

// Daily Analytics - For charts and trends
{
  "date": "YYYY-MM-DD",
  "tasks_completed": "number",
  "tasks_created": "number",
  "productivity_score": "number"  // 0-100 calculated metric
}
```

---

## API Endpoints

### 🔐 Authentication & User Management

#### Authentication Endpoints
```http
# Register a new user account
POST /auth/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string", 
  "password": "string",
  "first_name": "string",
  "last_name": "string"
}

Response 201: User object + tokens
Response 400: Validation errors
```

```http
# Login with username/email and password
POST /auth/login/
Content-Type: application/json

{
  "username": "string",    # Username or email
  "password": "string"
}

Response 200:
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": User
}
Response 401: Invalid credentials
```

```http
# Refresh access token using refresh token
POST /auth/refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}

Response 200:
{
  "access": "new_jwt_access_token"
}
Response 401: Invalid refresh token
```

```http
# Logout - blacklist refresh token (optional endpoint)
POST /auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}

Response 204: Successfully logged out
```

#### User Profile Management
```http
# Get current user profile
GET /auth/profile/
Authorization: Bearer <access_token>

Response 200: User object
Response 401: Unauthorized
```

```http
# Update user profile (partial update supported)
PATCH /auth/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "string",
  "last_name": "string",
  "profile": {
    "theme": "light" | "dark",
    "timezone": "string",
    "preferences": object
  }
}

Response 200: Updated User object
Response 400: Validation errors
```

```http
# Change password
POST /auth/change-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "string",
  "new_password": "string"
}

Response 200: Success message
Response 400: Invalid old password or validation errors
```

### 📝 Tasks Management

#### Core Task Operations
```http
# List all tasks for authenticated user with filtering and pagination
GET /tasks/
Authorization: Bearer <access_token>

Query Parameters:
- q: string                    # Search in title/notes (case-insensitive)
- category: uuid               # Filter by category ID
- priority: Low|Medium|High    # Filter by priority (can be repeated)
- completed: true|false        # Filter by completion status
- due_before: YYYY-MM-DD       # Tasks due before date
- due_after: YYYY-MM-DD        # Tasks due after date
- overdue: true|false          # Show only overdue tasks
- today: true|false            # Tasks due today
- sort: created_at|due_date|priority|title|updated_at
- order: asc|desc              # Default: desc for created_at
- page: number                 # Page number (default: 1)
- page_size: number           # Items per page (default: 20, max: 100)

Response 200: Paginated task list
Response 401: Unauthorized
```

```http
# Create a new task
POST /tasks/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "string",                    # Required
  "category": "uuid",                   # Required - must be user's category
  "priority": "Low" | "Medium" | "High", # Default: "Medium"
  "due_date": "YYYY-MM-DD" | null,
  "notes": "string" | null
}

Response 201: Created Task object
Response 400: Validation errors
Response 404: Category not found
```

```http
# Get specific task details
GET /tasks/{id}/
Authorization: Bearer <access_token>

Response 200: Task object
Response 404: Task not found or not owned by user
```

```http
# Update existing task (partial updates supported)
PATCH /tasks/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "string",
  "category": "uuid",
  "priority": "Low" | "Medium" | "High",
  "due_date": "YYYY-MM-DD" | null,
  "notes": "string" | null,
  "completed": true | false
}

Response 200: Updated Task object
Response 400: Validation errors
Response 404: Task not found
```

```http
# Delete a task permanently
DELETE /tasks/{id}/
Authorization: Bearer <access_token>

Response 204: Successfully deleted
Response 404: Task not found
```

#### Task Completion Operations
```http
# Toggle task completion status or set explicitly
PATCH /tasks/{id}/complete/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "completed": true | false     # Explicit completion status
}

Response 200: Updated Task object with completed_at timestamp
Response 404: Task not found
```

#### Bulk Task Operations
```http
# Perform bulk operations on multiple tasks
POST /tasks/bulk/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "action": "complete" | "delete" | "update",
  "task_ids": ["uuid", "uuid", ...],    # Array of task IDs to operate on
  "payload": {                          # Required for complete/update actions
    "completed": true|false,            # For action=complete
    "category": "uuid",                 # For action=update
    "priority": "Low|Medium|High"       # For action=update
  }
}

Response 200:
{
  "success_count": number,              # Successfully processed tasks
  "failed_count": number,               # Failed operations
  "errors": [                          # Details of failed operations
    {
      "task_id": "uuid",
      "error": "string"
    }
  ]
}
Response 400: Invalid action or payload
```

#### Task Import/Export
```http
# Export user's tasks as JSON
GET /tasks/export/
Authorization: Bearer <access_token>

Query Parameters:
- format: json|csv              # Export format (default: json)
- include_completed: true|false # Include completed tasks (default: true)

Response 200: 
Content-Type: application/json or text/csv
Content-Disposition: attachment; filename="tasks_export_YYYY-MM-DD.json"

# Returns tasks in exportable format
```

```http
# Import tasks from JSON file
POST /tasks/import/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "file": File,                 # JSON file with tasks array
  "merge_strategy": "skip" | "update" | "replace"  # How to handle duplicates
}

Response 200:
{
  "imported_count": number,
  "skipped_count": number,
  "errors": ["string", ...]
}
Response 400: Invalid file format or validation errors
```

### 📁 Categories Management

#### Category CRUD Operations
```http
# List all categories for authenticated user
GET /categories/
Authorization: Bearer <access_token>

Response 200:
{
  "count": number,
  "results": [Category, ...]
}
```

```http
# Create a new category
POST /categories/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "string",               # Required, must be unique per user
  "color": "#hexcode" | null      # Optional color for UI theming
}

Response 201: Created Category object
Response 400: Validation errors (e.g., duplicate name)
```

```http
# Get specific category with task count
GET /categories/{id}/
Authorization: Bearer <access_token>

Response 200: Category object with additional fields:
{
  ...Category,
  "task_count": number,           # Total tasks in category
  "completed_count": number,      # Completed tasks in category
  "pending_count": number         # Pending tasks in category
}
Response 404: Category not found
```

```http
# Update category (partial updates supported)
PATCH /categories/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "string",
  "color": "#hexcode" | null
}

Response 200: Updated Category object
Response 400: Validation errors
Response 404: Category not found
```

```http
# Delete category (with task reassignment)
DELETE /categories/{id}/
Authorization: Bearer <access_token>

Query Parameters:
- reassign_to: uuid    # Optional: reassign tasks to another category
                      # If omitted, tasks moved to default "General" category

Response 204: Successfully deleted
Response 400: Cannot delete if it's the only category
Response 404: Category not found
```

```http
# Get all tasks within a specific category
GET /categories/{id}/tasks/
Authorization: Bearer <access_token>

# Supports same filtering and pagination as GET /tasks/
Query Parameters: (same as tasks endpoint)

Response 200: Paginated task list filtered by category
Response 404: Category not found
```

### 📊 Analytics & Statistics

#### Dashboard Statistics
```http
# Get overview statistics for dashboard
GET /analytics/overview/
Authorization: Bearer <access_token>

Response 200: StatsOverview object
{
  "total_tasks": number,
  "completed_tasks": number,
  "overdue_tasks": number,
  "today_tasks": number,
  "completion_rate": number      # Percentage 0-100
}
```

```http
# Get completion streak information
GET /analytics/streak/
Authorization: Bearer <access_token>

Response 200: Streak object
{
  "current_streak": number,
  "longest_streak": number,
  "last_completion_date": "YYYY-MM-DD" | null
}
```

```http
# Get daily analytics for charts (time series data)
GET /analytics/daily/
Authorization: Bearer <access_token>

Query Parameters:
- start_date: YYYY-MM-DD       # Default: 30 days ago
- end_date: YYYY-MM-DD         # Default: today
- metric: completed|created|productivity  # Default: completed

Response 200:
{
  "count": number,
  "results": [
    {
      "date": "YYYY-MM-DD",
      "tasks_completed": number,
      "tasks_created": number,
      "productivity_score": number
    }
  ]
}
```

```http
# Get category-wise task distribution
GET /analytics/categories/
Authorization: Bearer <access_token>

Response 200:
{
  "count": number,
  "results": [
    {
      "category": Category,
      "task_count": number,
      "completion_percentage": number
    }
  ]
}
```

### 🔍 Search & Discovery

```http
# Unified search across all user's tasks
GET /search/
Authorization: Bearer <access_token>

Query Parameters:
- q: string                    # Required search term
- type: task|category|all      # Default: all
- page: number
- page_size: number

Response 200:
{
  "count": number,
  "results": {
    "tasks": [Task, ...],
    "categories": [Category, ...]
  }
}
```

```http
# Search suggestions/autocomplete
GET /search/suggestions/
Authorization: Bearer <access_token>

Query Parameters:
- q: string                    # Partial search term
- limit: number               # Default: 5, max: 10

Response 200:
{
  "suggestions": [
    {
      "type": "task" | "category",
      "id": "uuid",
      "title": "string",  
      "highlight": "string"      # Matched portion
    }
  ]
}
```

### ⚙️ System & Utilities

#### Health Check
```http
# Service health and status check
GET /health/
# No authentication required

Response 200:
{
  "status": "ok",
  "timestamp": "ISO-8601",
  "version": "string",
  "database": "connected" | "error",
  "cache": "connected" | "error"
}
```

#### API Information
```http
# Get API version and feature information
GET /info/
# No authentication required

Response 200:
{
  "version": "2.0",
  "features": [
    "bulk_operations",
    "import_export",
    "analytics",
    "search"
  ],
  "limits": {
    "max_tasks_per_user": 10000,
    "max_categories_per_user": 100,
    "max_file_size": "10MB"
  }
}
```

---

## Django Implementation Notes

### URL Patterns (urls.py)
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# API v1 URLs
urlpatterns = [
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/tasks/', include('tasks.urls')),
    path('api/v1/categories/', include('categories.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/search/', include('search.urls')),
    path('api/v1/health/', HealthCheckView.as_view()),
    path('api/v1/info/', APIInfoView.as_view()),
]
```

### Permissions & Security
- **Authentication**: `rest_framework_simplejwt.authentication.JWTAuthentication`
- **Permissions**: Custom `IsOwnerOrReadOnly` for user-specific data
- **Throttling**: Rate limiting for API endpoints
- **CORS**: Configured for frontend domains
- **Validation**: Django serializers with custom validators

### Database Considerations
- **Models**: Use Django ORM with PostgreSQL recommended
- **Indexing**: Add indexes on frequently queried fields (user_id, created_at, due_date)
- **Soft Delete**: Consider soft deletion for tasks (add `deleted_at` field)
- **Audit Trail**: Track changes with django-simple-history or similar

### Performance Optimizations
- **Caching**: Redis for analytics and frequently accessed data
- **Pagination**: Use cursor pagination for large datasets
- **Serialization**: Use `select_related()` and `prefetch_related()` to minimize queries
- **Background Tasks**: Use Celery for heavy operations (import/export, analytics)

---

## Example Requests

### Create Task with Full Details
```bash
curl -X POST "http://localhost:8000/api/v1/tasks/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project proposal",
    "category": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "High",
    "due_date": "2025-01-15",
    "notes": "Include budget breakdown and timeline"
  }'
```

### Search Tasks with Multiple Filters
```bash
curl -G "http://localhost:8000/api/v1/tasks/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  --data-urlencode "q=project" \
  --data-urlencode "priority=High" \
  --data-urlencode "completed=false" \
  --data-urlencode "sort=due_date" \
  --data-urlencode "order=asc"
```

### Bulk Complete Tasks
```bash
curl -X POST "http://localhost:8000/api/v1/tasks/bulk/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "complete",
    "task_ids": [
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222"
    ],
    "payload": {
      "completed": true
    }
  }'
```

### Get Analytics Dashboard Data
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "http://localhost:8000/api/v1/analytics/overview/"
```

---

## Error Codes Reference

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | validation_error | Request data validation failed |
| 401 | unauthorized | Authentication required or invalid token |
| 403 | forbidden | Access denied for this resource |
| 404 | not_found | Resource does not exist |
| 409 | conflict | Resource conflict (e.g., duplicate name) |
| 422 | unprocessable_entity | Semantic validation error |
| 429 | rate_limited | Too many requests |
| 500 | internal_error | Server error |

## Status Codes Summary

- **200 OK**: Successful GET, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request format or data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Valid format but semantic error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error