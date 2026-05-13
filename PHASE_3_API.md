# API Documentation - Student Management System

Base URL: `http://localhost:3000/api` (development)

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

**Error Response:**

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

---

## HTTP Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request (validation error)
- **404** - Not Found
- **409** - Conflict (duplicate email)
- **500** - Server Error

---

## Students Endpoints

### GET /api/students

List all students with pagination, search, filtering, and sorting.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max: 100) |
| `search` | string | - | Search by name, email, or phone |
| `status` | string | - | Filter by status (On Track, Behind, At Risk, Dropped, Completed) |
| `sortBy` | string | createdAt | Sort field (createdAt, lastContactedAt, lastCompletedAssignment, name) |
| `sortOrder` | string | desc | asc or desc |

**Response Example:**

```json
{
  "statusCode": 200,
  "message": "Students fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "whatsapp": "1234567890",
      "division": "Dhaka",
      "district": "Dhaka",
      "town": "Mirpur",
      "livingArea": "Urban",
      "occupation": "Student",
      "institute": "University",
      "educationalBackground": "HSC",
      "currentYear": "2024",
      "ageRange": "20-25",
      "workingDevice": "Laptop",
      "currentStatus": "On Track",
      "lastCompletedAssignment": "A-05",
      "mentorshipJoiningStatus": true,
      "assignmentCount": 5,
      "lastCallDate": "2024-05-10T10:30:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Examples:**

```bash
# Get first page of students
curl "http://localhost:3000/api/students?page=1&limit=10"

# Search for students by name
curl "http://localhost:3000/api/students?search=John&limit=20"

# Filter by status and sort by name
curl "http://localhost:3000/api/students?status=On%20Track&sortBy=name&sortOrder=asc"

# Search by email
curl "http://localhost:3000/api/students?search=john@example.com"
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
  "whatsapp": "1234567890",
  "division": "Dhaka",
  "district": "Dhaka",
  "town": "Mirpur",
  "livingArea": "Urban",
  "occupation": "Student",
  "institute": "University",
  "educationalBackground": "HSC",
  "currentYear": "2024",
  "ageRange": "20-25",
  "workingDevice": "Laptop",
  "currentStatus": "On Track",
  "lastCompletedAssignment": "A-05",
  "mentorshipJoiningStatus": true,
  "comments": ["Good performer", "Needs follow-up"]
}
```

**Required Fields:**

- `name` (string, 1+ characters)
- `email` (string, valid email format, unique)
- `phone` (string, 10+ digits)

**Optional Fields:**

- `whatsapp` (string)
- `division` (string)
- `district` (string)
- `town` (string)
- `livingArea` (string)
- `occupation` (string)
- `institute` (string)
- `educationalBackground` (string)
- `currentYear` (string)
- `ageRange` (16-17, 18-19, 20-25, 26-30, 31-40, 41-50, 50+)
- `workingDevice` (Laptop, Desktop, Mobile)
- `currentStatus` (On Track, Behind, At Risk, Dropped, Completed, default: On Track)
- `lastCompletedAssignment` (A-01 to A-10, default: None)
- `mentorshipJoiningStatus` (boolean)
- `comments` (array of strings)

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
    "currentStatus": "On Track",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "ageRange": "20-25",
    "currentStatus": "On Track"
  }'
```

**Error Response (409 Conflict - Duplicate Email):**

```json
{
  "statusCode": 409,
  "message": "email already exists",
  "errors": [
    {
      "field": "email",
      "message": "email already exists"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### GET /api/students/[id]

Get complete student profile with all relations and computed fields.

**Path Parameters:**

- `id` (string) - Student's MongoDB ObjectId

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
    "currentStatus": "On Track",
    "assignments": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "assignmentNumber": 1,
        "status": "COMPLETED",
        "completedDate": "2024-01-15T10:30:00.000Z",
        "notes": "Excellent work"
      }
    ],
    "callLogs": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "date": "2024-05-10T10:30:00.000Z",
        "status": "RECEIVED",
        "notes": "Discussed progress"
      }
    ],
    "followUps": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "date": "2024-05-20T00:00:00.000Z",
        "note": "Follow up on A-06"
      }
    ],
    "totalAssignmentsSubmitted": 5,
    "nextFollowUpDate": "2024-05-20T00:00:00.000Z",
    "daysSinceLastCall": 2,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Examples:**

```bash
curl http://localhost:3000/api/students/60d5ec49c1234567890abcde
```

**Error Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Student not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### PUT /api/students/[id]

Update an existing student. Supports partial updates.

**Path Parameters:**

- `id` (string) - Student's MongoDB ObjectId

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0987654321",
  "currentStatus": "Behind",
  "lastCompletedAssignment": "A-06"
}
```

**Note:** Cannot update `_id` and `createdAt` fields

**Response:**

```json
{
  "statusCode": 200,
  "message": "Student updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "0987654321",
    "currentStatus": "Behind",
    "updatedAt": "2024-05-13T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**

```bash
curl -X PUT http://localhost:3000/api/students/60d5ec49c1234567890abcde \
  -H "Content-Type: application/json" \
  -d '{
    "currentStatus": "Behind",
    "phone": "0987654321"
  }'
```

---

### DELETE /api/students/[id]

Delete a student and all related data (assignments, call logs, follow-ups).

**Path Parameters:**

- `id` (string) - Student's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "message": "Student deleted successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/students/60d5ec49c1234567890abcde
```

---

### GET /api/students/search

Advanced search with multiple filter options.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Search by name (partial match, case-insensitive) |
| `email` | string | Search by email (exact match) |
| `phone` | string | Search by phone (partial match) |
| `status` | string | Filter by status |
| `division` | string | Filter by division |
| `ageRange` | string | Filter by age range |
| `workingDevice` | string | Filter by device (Laptop, Desktop, Mobile) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

**Response:**

```json
{
  "statusCode": 200,
  "message": "Search completed successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "currentStatus": "On Track",
      "ageRange": "20-25",
      "workingDevice": "Laptop"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Examples:**

```bash
# Search by multiple filters
curl "http://localhost:3000/api/students/search?status=On%20Track&ageRange=20-25&division=Dhaka"

# Search by name
curl "http://localhost:3000/api/students/search?name=John&limit=5"

# Search by email
curl "http://localhost:3000/api/students/search?email=john@example.com"
```

---

### GET /api/students/[id]/assignments

Get all assignments for a student with statistics.

**Path Parameters:**

- `id` (string) - Student's MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "message": "Assignments fetched successfully",
  "data": {
    "assignments": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "assignmentNumber": 1,
        "status": "COMPLETED",
        "completedDate": "2024-01-15T10:30:00.000Z",
        "notes": "Excellent work",
        "studentId": "60d5ec49c1234567890abcde"
      }
    ],
    "stats": {
      "totalAssignments": 10,
      "totalSubmitted": 5,
      "totalPending": 5,
      "percentageComplete": 50
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**

```bash
curl http://localhost:3000/api/students/60d5ec49c1234567890abcde/assignments
```

---

### PUT /api/students/[id]/status

Update only the status field of a student.

**Path Parameters:**

- `id` (string) - Student's MongoDB ObjectId

**Request Body:**

```json
{
  "status": "Behind"
}
```

**Valid Statuses:**

- On Track
- Behind
- At Risk
- Dropped
- Completed

**Response:**

```json
{
  "statusCode": 200,
  "message": "Student status updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Doe",
    "currentStatus": "Behind",
    "updatedAt": "2024-05-13T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**

```bash
curl -X PUT http://localhost:3000/api/students/60d5ec49c1234567890abcde/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "At Risk"
  }'
```

---

### POST /api/students/bulk-update

Update status for multiple students at once.

**Request Body:**

```json
{
  "studentIds": [
    "60d5ec49c1234567890abcde",
    "60d5ec49c1234567890abcdf"
  ],
  "status": "Behind"
}
```

**Required Fields:**

- `studentIds` (array of strings) - Student ObjectIds
- `status` (string) - New status for all students

**Response:**

```json
{
  "statusCode": 200,
  "message": "Students updated successfully",
  "data": {
    "updated": 2,
    "total": 2
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/students/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": [
      "60d5ec49c1234567890abcde",
      "60d5ec49c1234567890abcdf"
    ],
    "status": "At Risk"
  }'
```

---

## Input Validation & Sanitization

All endpoints automatically:

- Trim whitespace from text fields
- Lowercase email addresses
- Remove special characters from phone numbers (keep only digits)
- Validate email format and uniqueness
- Prevent XSS and injection attacks

---

## Error Handling Examples

**Validation Error (400):**

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "phone",
      "message": "Phone number must be at least 10 digits"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Database Validation Error (400):**

```json
{
  "statusCode": 400,
  "message": "Database validation error",
  "errors": [
    {
      "field": "name",
      "message": "Please provide a name"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Duplicate Email Error (409):**

```json
{
  "statusCode": 409,
  "message": "email already exists",
  "errors": [
    {
      "field": "email",
      "message": "email already exists"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Pagination

All list endpoints support pagination with these parameters:

- `page` (number, default: 1) - Page number (starts at 1)
- `limit` (number, default: 10) - Items per page (max: 100)

Response includes pagination metadata:

```json
"pagination": {
  "page": 1,
  "limit": 10,
  "total": 45,
  "pages": 5
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- Student IDs are MongoDB ObjectIds (24 hex characters)
- Email addresses are case-insensitive and must be unique
- Phone numbers should contain at least 10 digits
- Status values are case-sensitive ("On Track", not "on track")
- Logging is enabled for all API operations in development and production
