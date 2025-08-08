# TaskFlow API Specification (Draft v1)

This document outlines the REST API endpoints needed by the TaskFlow web app. It includes request/response shapes, status codes, and pagination patterns.

Base URL
- Production: https://api.taskflow.example.com/v1
- Staging: https://staging.api.taskflow.example.com/v1

Auth
- Scheme: Bearer token in Authorization header (Authorization: Bearer <token>)
- If using Supabase Auth, tokens are obtained via Supabase and forwarded with requests

Error Format
All non-2xx responses return this shape:
{
  "error": {
    "code": "string",        // machine-readable code
    "message": "string",     // human-readable message
    "details": object|null    // optional extra data
  }
}

Pagination
- Query params: page (default 1), perPage (default 20, max 100)
- Response includes meta and links
{
  "data": [...],
  "meta": { "page": 1, "perPage": 20, "total": 125, "totalPages": 7 },
  "links": { "self": "...", "next": "...", "prev": "..." }
}

Resource Models
Task
{
  "id": "uuid",
  "title": "string",
  "categoryId": "uuid",
  "priority": "Low" | "Medium" | "High",
  "dueDate": "YYYY-MM-DD" | null,
  "notes": "string" | null,
  "completed": true | false,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "completedAt": "ISO-8601" | null
}

Category
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}

StatsOverview
{
  "totalTasks": number,
  "completedTasks": number,
  "overdueTasks": number,
  "todayTasks": number
}

Streak
{
  "currentStreak": number,     // consecutive days with any completion
  "longestStreak": number
}


Tasks
GET /tasks
List tasks with filtering, sorting, and pagination.
Query params:
- q: string (search in title/notes)
- categoryId: uuid
- priority: Low|Medium|High (repeatable: priority=High&priority=Low)
- completed: true|false
- dueBefore: YYYY-MM-DD
- dueAfter: YYYY-MM-DD
- sort: createdAt|dueDate|priority|title
- order: asc|desc (default desc for createdAt)
- page, perPage
Response 200
{
  "data": [Task, ...],
  "meta": { ... },
  "links": { ... }
}

POST /tasks
Create a new task.
Request
{
  "title": "string",
  "categoryId": "uuid",
  "priority": "Low" | "Medium" | "High",
  "dueDate": "YYYY-MM-DD" | null,
  "notes": "string" | null
}
Response 201
Task
Errors
- 400 invalid_body
- 404 category_not_found

GET /tasks/{id}
Fetch a single task.
Response 200
Task
Errors
- 404 task_not_found

PATCH /tasks/{id}
Update an existing task (partial update).
Request (any subset)
{
  "title": "string",
  "categoryId": "uuid",
  "priority": "Low" | "Medium" | "High",
  "dueDate": "YYYY-MM-DD" | null,
  "notes": "string" | null,
  "completed": true | false
}
Response 200
Task
Errors
- 404 task_not_found

DELETE /tasks/{id}
Delete a task.
Response 204 (no body)
Errors
- 404 task_not_found

PATCH /tasks/{id}/complete
Toggle or set completion state explicitly.
Request
{
  "completed": true | false
}
Response 200
Task

POST /tasks/bulk
Bulk operations on tasks.
Request
{
  "action": "complete" | "delete" | "update",
  "ids": ["uuid", ...],
  "payload": {                 // required for complete/update
    "completed": true|false    // for action=complete
    // or any updatable Task fields for action=update
  }
}
Response 200
{
  "updated": number,
  "failed": number,
  "errors": [ { "id": "uuid", "error": { ... } } ]
}


Categories
GET /categories
List categories.
Response 200
{
  "data": [Category, ...]
}

POST /categories
Create a category.
Request
{
  "name": "string"
}
Response 201
Category
Errors
- 409 category_exists

GET /categories/{id}
Fetch a category.
Response 200
Category
Errors
- 404 category_not_found

PATCH /categories/{id}
Rename a category.
Request
{
  "name": "string"
}
Response 200
Category
Errors
- 409 category_exists

DELETE /categories/{id}
Delete a category. Tasks with this category should be reassigned to a default category (e.g., "General") or rejected if not allowed.
Query params:
- reassignTo: uuid (optional; if omitted, server reassigns to default)
Response 204

GET /categories/{id}/tasks
List tasks within a category (supports same filters/pagination as GET /tasks).
Response 200
{
  "data": [Task, ...],
  "meta": { ... },
  "links": { ... }
}


Stats & Insights
GET /stats/overview
Aggregate counts for dashboard.
Response 200
StatsOverview

GET /stats/streak
Task completion streaks.
Response 200
Streak


Search
GET /search
Unified search across tasks (alias for GET /tasks?q=...).
Query params: same as GET /tasks with q required.
Response 200
{
  "data": [Task, ...],
  "meta": { ... },
  "links": { ... }
}


Health
GET /health
Service health check.
Response 200
{
  "status": "ok",
  "time": "ISO-8601"
}


Headers
- Content-Type: application/json for all request bodies
- Authorization: Bearer <token> when authenticated


Examples
Create Task
curl -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Outline weekly report",
    "categoryId": "11111111-1111-1111-1111-111111111111",
    "priority": "High",
    "dueDate": "2025-08-10",
    "notes": "Focus on Q3 KPIs"
  }'

Search Tasks
curl -G "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "q=report" \
  --data-urlencode "priority=High" \
  --data-urlencode "page=1" \
  --data-urlencode "perPage=20"

Toggle Complete
curl -X PATCH "$BASE_URL/tasks/abcd-efgh-.../complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "completed": true }'

Notes
- For a pure Supabase implementation without a custom server, these endpoints can be mapped to Supabase tables and RPCs; the shapes above reflect the app’s needs based on current UI and context.
