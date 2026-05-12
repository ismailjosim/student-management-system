# API Documentation

Base URL: `http://localhost:3000/api` (development) or `https://yourdomain.com/api` (production)

## Response Format

All responses follow this standard format:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {},
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Error responses include an `errors` array:

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Health Check

### GET /api/health

Test API and database connectivity.

**Response:**

```json
{
  "statusCode": 200,
  "message": "Health check passed",
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**cURL:**

```bash
curl http://localhost:3000/api/health
```

---

## Students

### GET /api/students

Fetch all students with pagination.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page (max: 100)

**Response:**

```json
{
  "statusCode": 200,
  "message": "Students fetched successfully",
  "data": {
    "data": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "enrollmentDate": "2024-01-01T00:00:00.000Z",
        "status": "active",
        "currentGrade": 85,
        "address": "123 Main St",
        "parentName": "Jane Doe",
        "parentPhone": "9876543210",
        "notes": "Top performer",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**cURL:**

```bash
curl "http://localhost:3000/api/students?page=1&limit=10"
```

**JavaScript (fetch):**

```javascript
const response = await fetch('/api/students?page=1&limit=10');
const result = await response.json();
```

---

### POST /api/students

Create a new student.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "enrollmentDate": "2024-01-01",
  "status": "active",
  "currentGrade": 85,
  "address": "123 Main St",
  "parentName": "Jane Doe",
  "parentPhone": "9876543210",
  "notes": "Top performer"
}
```

**Required Fields:**

- `name` (string)
- `email` (string, unique)
- `phone` (string)
- `enrollmentDate` (string or Date)

**Optional Fields:**

- `status` (active | inactive | graduated | dropped, default: active)
- `currentGrade` (number, 0-100)
- `address` (string)
- `parentName` (string)
- `parentPhone` (string)
- `notes` (string)

**Response:** (201 Created)

```json
{
  "statusCode": 201,
  "message": "Student created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "enrollmentDate": "2024-01-01T00:00:00.000Z",
    "status": "active",
    "currentGrade": 85,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "enrollmentDate": "2024-01-01"
  }'
```

---

### GET /api/students/[id]

Fetch a specific student by ID.

**URL Parameter:**

- `id` (string) - Student MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "message": "Student fetched successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "enrollmentDate": "2024-01-01T00:00:00.000Z",
    "status": "active",
    "currentGrade": 85,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**cURL:**

```bash
curl http://localhost:3000/api/students/60d5ec49c1234567890abcde
```

---

### PUT /api/students/[id]

Update a student.

**URL Parameter:**

- `id` (string) - Student MongoDB ObjectId

**Request Body:** (all fields optional)

```json
{
  "name": "Jane Doe",
  "status": "graduated",
  "currentGrade": 90
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Student updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "Jane Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "status": "graduated",
    "currentGrade": 90,
    "updatedAt": "2024-01-01T13:00:00.000Z"
  },
  "timestamp": "2024-01-01T13:00:00.000Z"
}
```

**cURL:**

```bash
curl -X PUT http://localhost:3000/api/students/60d5ec49c1234567890abcde \
  -H "Content-Type: application/json" \
  -d '{"status": "graduated"}'
```

---

### DELETE /api/students/[id]

Delete a student.

**URL Parameter:**

- `id` (string) - Student MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "message": "Student deleted successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**cURL:**

```bash
curl -X DELETE http://localhost:3000/api/students/60d5ec49c1234567890abcde
```

---

## Assignments

### GET /api/assignments

Fetch all assignments.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `studentId` (string, optional) - Filter by student

**Response:** Similar to students list with pagination

**cURL:**

```bash
curl "http://localhost:3000/api/assignments?studentId=60d5ec49c1234567890abcde"
```

---

### POST /api/assignments

Create a new assignment.

**Request Body:**

```json
{
  "studentId": "60d5ec49c1234567890abcde",
  "title": "Math Homework Chapter 5",
  "description": "Complete exercises 1-20 on page 45",
  "dueDate": "2024-01-15",
  "status": "pending"
}
```

**Required Fields:**

- `studentId` (string)
- `title` (string)
- `description` (string)
- `dueDate` (string or Date)

**Optional Fields:**

- `status` (pending | submitted | graded | overdue, default: pending)

---

### GET /api/assignments/[id]

Fetch a specific assignment.

---

### PUT /api/assignments/[id]

Update an assignment.

**Request Body:** (all fields optional)

```json
{
  "status": "graded",
  "grade": 95,
  "feedback": "Excellent work!"
}
```

---

### DELETE /api/assignments/[id]

Delete an assignment.

---

## Call Logs

### GET /api/call-logs

Fetch all call logs (sorted by date, newest first).

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `studentId` (string, optional) - Filter by student

---

### POST /api/call-logs

Create a new call log.

**Request Body:**

```json
{
  "studentId": "60d5ec49c1234567890abcde",
  "callDate": "2024-01-01T10:30:00",
  "duration": 15,
  "notes": "Discussed progress on assignments",
  "callType": "phone",
  "status": "completed",
  "nextCallDate": "2024-01-08"
}
```

**Required Fields:**

- `studentId` (string)
- `callDate` (string or Date)
- `duration` (number, minutes)
- `notes` (string)
- `callType` (phone | video | message)

**Optional Fields:**

- `status` (completed | missed | scheduled, default: completed)
- `nextCallDate` (string or Date)

---

### GET /api/call-logs/[id]

Fetch a specific call log.

---

### PUT /api/call-logs/[id]

Update a call log.

---

### DELETE /api/call-logs/[id]

Delete a call log.

---

## Follow-ups

### GET /api/follow-ups

Fetch all follow-ups (sorted by due date).

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `studentId` (string, optional) - Filter by student
- `status` (string, optional) - Filter by status

---

### POST /api/follow-ups

Create a new follow-up.

**Request Body:**

```json
{
  "studentId": "60d5ec49c1234567890abcde",
  "title": "Check on Math Grade",
  "description": "Schedule extra tutoring if grade drops",
  "dueDate": "2024-01-10",
  "priority": "high",
  "status": "pending",
  "assignedTo": "mentor_name",
  "tags": ["math", "grades", "urgent"]
}
```

**Required Fields:**

- `studentId` (string)
- `title` (string)
- `description` (string)
- `dueDate` (string or Date)
- `priority` (low | medium | high)

**Optional Fields:**

- `status` (pending | in-progress | completed, default: pending)
- `assignedTo` (string)
- `tags` (array of strings)

---

### GET /api/follow-ups/[id]

Fetch a specific follow-up.

---

### PUT /api/follow-ups/[id]

Update a follow-up.

---

### DELETE /api/follow-ups/[id]

Delete a follow-up.

---

## Dashboard

### GET /api/dashboard

Get dashboard statistics.

**Response:**

```json
{
  "statusCode": 200,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalStudents": 45,
    "activeStudents": 42,
    "totalAssignments": 156,
    "pendingAssignments": 23,
    "totalCallLogs": 189,
    "pendingFollowUps": 15
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**cURL:**

```bash
curl http://localhost:3000/api/dashboard
```

---

## Error Codes

| Status | Message | Meaning |
|--------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (e.g., email already exists) |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Database connection failed |

---

## Client-Side Usage

### Using apiClient

```typescript
import { studentApi } from '@/lib/api-client';

// Get all students
const { data, error } = await studentApi.getAll();

// Create student
const { data, error } = await studentApi.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  enrollmentDate: new Date()
});

// Update student
const { data, error } = await studentApi.update('id', {
  status: 'graduated'
});

// Delete student
const { data, error } = await studentApi.delete('id');
```

---

## Rate Limiting & Pagination

- No rate limiting currently implemented
- All list endpoints support pagination with `page` and `limit` parameters
- Default limit is 10, maximum is 100

---

## Authentication

Currently no authentication is implemented. In production, implement:

- JWT tokens
- Session-based authentication
- Or API keys

---

For more information, see [DEVELOPMENT.md](DEVELOPMENT.md)
