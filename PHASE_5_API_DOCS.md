# 📞 Phase 5 API Documentation

## Call Log Endpoints

### 1. GET /api/call-logs

**Description:** List all call logs with filtering and pagination

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page
- `studentId` (string, optional) - Filter by student ID
- `status` (string, optional) - Filter by status (RECEIVED, NOT_RECEIVED, PHONE_OFF, SWITCHED_OFF, FOREIGN_NUMBER)
- `calledBy` (string, optional) - Filter by coordinator name
- `startDate` (ISO 8601 string, optional) - Filter by date range start
- `endDate` (ISO 8601 string, optional) - Filter by date range end

**Example Request:**

```bash
GET /api/call-logs?page=1&limit=10&status=RECEIVED&startDate=2024-01-01&endDate=2024-12-31
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Call logs fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "date": "2024-01-15T10:30:00.000Z",
        "status": "RECEIVED",
        "notes": "Student confirmed participation",
        "calledBy": "John Coordinator",
        "issues": "Slow internet connection",
        "promised": "Will submit assignment by Jan 20",
        "nextFollowUp": "2024-01-22T10:30:00.000Z",
        "studentId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Ahmed Ali",
          "email": "ahmed@example.com",
          "phone": "01234567890"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "RECEIVED": 120,
      "NOT_RECEIVED": 20,
      "PHONE_OFF": 8,
      "SWITCHED_OFF": 2,
      "FOREIGN_NUMBER": 0
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

---

### 2. GET /api/call-logs/[id]

**Description:** Get a specific call log by ID

**Parameters:**

- `id` (string, required) - Call log MongoDB ObjectId

**Example Request:**

```bash
GET /api/call-logs/507f1f77bcf86cd799439011
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Call log fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T10:30:00.000Z",
    "status": "RECEIVED",
    "notes": "Student confirmed participation",
    "calledBy": "John Coordinator",
    "issues": "Slow internet connection",
    "promised": "Will submit assignment by Jan 20",
    "nextFollowUp": "2024-01-22T10:30:00.000Z",
    "studentId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Ahmed Ali",
      "email": "ahmed@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3. POST /api/students/[id]/call-logs

**Description:** Create a new call log for a specific student

**Parameters:**

- `id` (string, required) - Student MongoDB ObjectId

**Request Body:**

```json
{
  "date": "2024-01-15T10:30:00Z",
  "status": "RECEIVED",
  "notes": "Student confirmed participation",
  "calledBy": "John Coordinator",
  "issues": "Slow internet",
  "promised": "Will submit by Jan 20"
}
```

**Validation Rules:**

- `date` (required, ISO 8601) - Must not be in the future
- `status` (required, enum) - RECEIVED, NOT_RECEIVED, PHONE_OFF, SWITCHED_OFF, FOREIGN_NUMBER
- `notes` (optional, string)
- `calledBy` (optional, string)
- `issues` (optional, string)
- `promised` (optional, string)

**Example Request:**

```bash
POST /api/students/507f1f77bcf86cd799439012/call-logs
Content-Type: application/json

{
  "date": "2024-01-15T10:30:00Z",
  "status": "RECEIVED",
  "notes": "Discussed assignment progress",
  "calledBy": "John"
}
```

**Example Response (201 Created):**

```json
{
  "statusCode": 201,
  "message": "Call log created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T10:30:00.000Z",
    "status": "RECEIVED",
    "notes": "Discussed assignment progress",
    "calledBy": "John",
    "nextFollowUp": "2024-01-22T10:30:00.000Z",
    "studentId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Side Effects:**

- Auto-creates follow-up for date + 7 days
- Updates student's `lastContactedAt` field

---

### 4. PUT /api/call-logs/[id]

**Description:** Update an existing call log

**Parameters:**

- `id` (string, required) - Call log MongoDB ObjectId

**Request Body (all optional):**

```json
{
  "date": "2024-01-16T11:00:00Z",
  "status": "NOT_RECEIVED",
  "notes": "Updated notes",
  "calledBy": "Jane",
  "issues": "Connection dropped",
  "promised": "Will try again tomorrow"
}
```

**Example Request:**

```bash
PUT /api/call-logs/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "status": "NOT_RECEIVED",
  "notes": "Phone not reachable"
}
```

**Example Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Call log updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T10:30:00.000Z",
    "status": "NOT_RECEIVED",
    "notes": "Phone not reachable",
    "nextFollowUp": "2024-01-22T10:30:00.000Z",
    "updatedAt": "2024-01-16T11:00:00.000Z"
  }
}
```

**Auto-Calculation:**

- If `date` is updated, `nextFollowUp` is automatically recalculated

---

### 5. DELETE /api/call-logs/[id]

**Description:** Delete a call log

**Parameters:**

- `id` (string, required) - Call log MongoDB ObjectId

**Example Request:**

```bash
DELETE /api/call-logs/507f1f77bcf86cd799439011
```

**Example Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Call log deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "date": "2024-01-15T10:30:00.000Z",
    "status": "RECEIVED"
  }
}
```

**Side Effects:**

- Updates student's `lastContactedAt` to the most recent remaining call log date

---

### 6. GET /api/students/[id]/call-logs

**Description:** Get all call logs for a specific student

**Parameters:**

- `id` (string, required) - Student MongoDB ObjectId

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)

**Example Request:**

```bash
GET /api/students/507f1f77bcf86cd799439012/call-logs?page=1&limit=20
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Student call history fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "date": "2024-01-15T10:30:00.000Z",
        "status": "RECEIVED",
        "notes": "Discussed progress"
      },
      {
        "_id": "507f1f77bcf86cd799439010",
        "date": "2024-01-08T10:00:00.000Z",
        "status": "NOT_RECEIVED",
        "notes": "Phone off"
      }
    ],
    "summary": {
      "totalCalls": 2,
      "lastCallDate": "2024-01-15T10:30:00.000Z",
      "callsByStatus": {
        "RECEIVED": 1,
        "NOT_RECEIVED": 1
      },
      "averageTimesBetweenCalls": 7
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

---

### 7. POST /api/call-logs (Batch)

**Description:** Create multiple call logs at once

**Request Body:**

```json
{
  "callLogs": [
    {
      "studentId": "507f1f77bcf86cd799439012",
      "date": "2024-01-15T10:30:00Z",
      "status": "RECEIVED",
      "notes": "First call"
    },
    {
      "studentId": "507f1f77bcf86cd799439013",
      "date": "2024-01-15T11:00:00Z",
      "status": "NOT_RECEIVED",
      "notes": "Phone off"
    }
  ]
}
```

**Example Request:**

```bash
POST /api/call-logs
Content-Type: application/json

{
  "callLogs": [
    {
      "studentId": "507f1f77bcf86cd799439012",
      "date": "2024-01-15T10:30:00Z",
      "status": "RECEIVED"
    },
    {
      "studentId": "507f1f77bcf86cd799439013",
      "date": "2024-01-15T11:00:00Z",
      "status": "NOT_RECEIVED"
    }
  ]
}
```

**Example Response (207 Multi-Status):**

```json
{
  "statusCode": 207,
  "message": "Batch operation completed",
  "data": {
    "created": 2,
    "failed": 0,
    "errors": []
  }
}
```

**Partial Failure Response:**

```json
{
  "statusCode": 207,
  "message": "Batch operation completed",
  "data": {
    "created": 1,
    "failed": 1,
    "errors": [
      {
        "studentId": "507f1f77bcf86cd799439099",
        "error": "Student not found"
      }
    ]
  }
}
```

---

## Follow-Up Endpoints

### 8. POST /api/follow-ups

**Description:** Create a new follow-up

**Request Body:**

```json
{
  "studentId": "507f1f77bcf86cd799439012",
  "date": "2024-01-22T10:30:00Z",
  "note": "Check if assignment was submitted"
}
```

**Validation Rules:**

- `studentId` (required, string) - Must be valid MongoDB ObjectId
- `date` (required, ISO 8601) - Must be in the future
- `note` (required, string) - Min 1 character

**Example Request:**

```bash
POST /api/follow-ups
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439012",
  "date": "2024-01-22T10:30:00Z",
  "note": "Check assignment submission"
}
```

**Example Response (201 Created):**

```json
{
  "statusCode": 201,
  "message": "Follow-up created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "studentId": "507f1f77bcf86cd799439012",
    "date": "2024-01-22T10:30:00.000Z",
    "note": "Check assignment submission",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 9. GET /api/follow-ups

**Description:** List all follow-ups with filtering

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `studentId` (string, optional) - Filter by student
- `status` (string, optional) - pending, completed, overdue
- `startDate` (ISO 8601, optional) - Filter by date range start
- `endDate` (ISO 8601, optional) - Filter by date range end

**Example Request:**

```bash
GET /api/follow-ups?status=pending&page=1&limit=20
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Follow-ups fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "studentId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Ahmed Ali",
          "email": "ahmed@example.com"
        },
        "date": "2024-01-22T10:30:00.000Z",
        "note": "Check assignment submission",
        "status": "pending"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### 10. GET /api/follow-ups/upcoming

**Description:** Get upcoming follow-ups grouped by date

**Query Parameters:**

- `daysAhead` (number, default: 7) - Number of days to look ahead
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Example Request:**

```bash
GET /api/follow-ups/upcoming?daysAhead=7
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Upcoming follow-ups fetched successfully",
  "data": {
    "data": {
      "today": [
        {
          "_id": "507f1f77bcf86cd799439020",
          "date": "2024-01-16T10:30:00.000Z",
          "note": "Check progress",
          "studentId": {
            "name": "Ahmed Ali",
            "phone": "01234567890"
          }
        }
      ],
      "upcoming": [
        [
          "2024-01-17",
          [
            {
              "_id": "507f1f77bcf86cd799439021",
              "date": "2024-01-17T14:00:00.000Z",
              "note": "Assignment submission check"
            }
          ]
        ],
        [
          "2024-01-18",
          [
            {
              "_id": "507f1f77bcf86cd799439022",
              "date": "2024-01-18T09:00:00.000Z",
              "note": "Progress review"
            }
          ]
        ]
      ]
    },
    "stats": {
      "total": 15,
      "todayCount": 3,
      "upcomingCount": 12
    }
  }
}
```

---

### 11. GET /api/students/[id]/follow-ups

**Description:** Get all follow-ups for a specific student

**Parameters:**

- `id` (string, required) - Student MongoDB ObjectId

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `includeCompleted` (boolean, default: false) - Include completed follow-ups

**Example Request:**

```bash
GET /api/students/507f1f77bcf86cd799439012/follow-ups?includeCompleted=false
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Student follow-ups fetched successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "date": "2024-01-22T10:30:00.000Z",
        "note": "Assignment check",
        "status": "pending"
      }
    ],
    "nextScheduled": {
      "_id": "507f1f77bcf86cd799439020",
      "date": "2024-01-22T10:30:00.000Z",
      "status": "pending"
    },
    "lastCompleted": {
      "_id": "507f1f77bcf86cd799439019",
      "date": "2024-01-15T10:30:00.000Z",
      "completedDate": "2024-01-15T15:00:00.000Z",
      "status": "completed"
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

---

### 12. PUT /api/follow-ups/[id]

**Description:** Update a follow-up (reschedule or modify)

**Parameters:**

- `id` (string, required) - Follow-up MongoDB ObjectId

**Request Body (all optional):**

```json
{
  "date": "2024-01-25T10:30:00Z",
  "note": "Updated note",
  "status": "pending"
}
```

**Example Request:**

```bash
PUT /api/follow-ups/507f1f77bcf86cd799439020
Content-Type: application/json

{
  "date": "2024-01-25T10:30:00Z",
  "note": "Rescheduled check"
}
```

**Example Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Follow-up updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "date": "2024-01-25T10:30:00.000Z",
    "note": "Rescheduled check",
    "status": "pending",
    "updatedAt": "2024-01-16T11:00:00.000Z"
  }
}
```

---

### 13. DELETE /api/follow-ups/[id]

**Description:** Delete a follow-up

**Parameters:**

- `id` (string, required) - Follow-up MongoDB ObjectId

**Example Request:**

```bash
DELETE /api/follow-ups/507f1f77bcf86cd799439020
```

**Example Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Follow-up deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "date": "2024-01-22T10:30:00.000Z",
    "status": "pending"
  }
}
```

---

### 14. PUT /api/follow-ups/[id]/complete

**Description:** Mark a follow-up as completed

**Parameters:**

- `id` (string, required) - Follow-up MongoDB ObjectId

**Request Body (optional):**

```json
{
  "completedDate": "2024-01-22T15:00:00Z"
}
```

**Example Request:**

```bash
PUT /api/follow-ups/507f1f77bcf86cd799439020/complete
Content-Type: application/json
```

**Example Response (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Follow-up marked as completed",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "date": "2024-01-22T10:30:00.000Z",
    "note": "Assignment check",
    "status": "completed",
    "completedDate": "2024-01-22T15:00:00.000Z",
    "updatedAt": "2024-01-22T15:00:00.000Z"
  }
}
```

---

## Analytics & Queue Endpoints

### 15. GET /api/call-queue

**Description:** Get priority-sorted list of students needing calls

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 50)

**Example Request:**

```bash
GET /api/call-queue?limit=50
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Call queue generated successfully",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Ahmed Ali",
        "email": "ahmed@example.com",
        "phone": "01234567890",
        "whatsapp": "01234567890",
        "priority": "high",
        "lastCall": {
          "date": "2024-01-08T10:00:00.000Z",
          "status": "RECEIVED"
        },
        "nextFollowUp": {
          "_id": "507f1f77bcf86cd799439020",
          "date": "2024-01-22T10:30:00.000Z"
        },
        "overdueFollowUp": {
          "_id": "507f1f77bcf86cd799439019",
          "date": "2024-01-15T10:30:00.000Z"
        }
      }
    ],
    "stats": {
      "total": 15,
      "highPriority": 5,
      "normalPriority": 10
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

### 16. GET /api/call-statistics

**Description:** Get comprehensive call analytics

**Example Request:**

```bash
GET /api/call-statistics
```

**Example Response:**

```json
{
  "statusCode": 200,
  "message": "Call statistics fetched successfully",
  "data": {
    "totalCalls": 150,
    "callsThisWeek": 25,
    "callsByStatus": {
      "RECEIVED": 120,
      "NOT_RECEIVED": 20,
      "PHONE_OFF": 8,
      "SWITCHED_OFF": 2,
      "FOREIGN_NUMBER": 0
    },
    "successRate": "80.0%",
    "averageCallsPerStudent": 3.75,
    "studentsNeverCalled": 5,
    "avgDaysBetweenCalls": 3.5,
    "reachability": {
      "high": 120,
      "medium": 20,
      "low": 10
    }
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Invalid student ID",
  "errors": ["Student ID must be a valid MongoDB ObjectId"]
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Student not found"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to fetch call logs",
  "errors": ["Database connection error"]
}
```

---

## Status Codes Summary

| Code | Description |
|------|-------------|
| 200 | OK - Successful GET/PUT/DELETE |
| 201 | Created - Successful POST |
| 207 | Multi-Status - Partial success in batch operations |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Query Patterns

### Get all pending follow-ups

```bash
GET /api/follow-ups?status=pending
```

### Get follow-ups for specific student

```bash
GET /api/students/{studentId}/follow-ups
```

### Get follow-ups due today

```bash
GET /api/follow-ups/upcoming?daysAhead=0
```

### Get call logs by status for date range

```bash
GET /api/call-logs?status=RECEIVED&startDate=2024-01-01&endDate=2024-01-31
```

### Get student's call history with pagination

```bash
GET /api/students/{studentId}/call-logs?page=1&limit=20
```

---

## Data Types

### CallLog Status

```typescript
type CallLogStatus = 'RECEIVED' | 'NOT_RECEIVED' | 'PHONE_OFF' | 'SWITCHED_OFF' | 'FOREIGN_NUMBER'
```

### FollowUp Status

```typescript
type FollowUpStatus = 'pending' | 'completed' | 'overdue'
```

### Priority Levels

```typescript
type Priority = 'high' | 'normal'
// high: Has overdue follow-ups
// normal: Other cases
```
