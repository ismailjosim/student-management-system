# Phase 4: Backend API - Assignment Management Documentation

## ✅ Completion Status: 100%

All 7 new endpoints have been successfully implemented.

---

## API Endpoints Overview

### 1. GET /api/assignments - List All Assignments ✅

**Description:** Retrieve paginated list of assignments with filtering and statistics.

**Query Parameters:**

- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10, max: 100) - Items per page
- `studentId` (string, optional) - Filter by student ID
- `assignmentNumber` (number, 1-10, optional) - Filter by assignment number
- `status` (string, optional) - Filter by status (PENDING, SUBMITTED, COMPLETED, NOT_DEFINED)
- `startDate` (ISO date, optional) - Filter by completion date (start)
- `endDate` (ISO date, optional) - Filter by completion date (end)

**Response:**

```json
{
  "statusCode": 200,
  "message": "Assignments fetched successfully",
  "data": [
    {
      "_id": "...",
      "assignmentNumber": 1,
      "status": "SUBMITTED",
      "completedDate": "2024-05-01T10:30:00Z",
      "notes": "...",
      "studentId": {...},
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "stats": {
    "totalAssignments": 50,
    "submittedCount": 35,
    "completedCount": 25,
    "pendingCount": 15
  }
}
```

**File:** `src/app/api/assignments/route.ts`

---

### 2. GET /api/assignments/[id] - Get Single Assignment ✅

**Description:** Retrieve complete details of a specific assignment.

**Path Parameters:**

- `id` (string, required) - Assignment MongoDB ObjectId

**Response:**

```json
{
  "statusCode": 200,
  "message": "Assignment fetched successfully",
  "data": {
    "_id": "...",
    "assignmentNumber": 1,
    "status": "SUBMITTED",
    "completedDate": "2024-05-01T10:30:00Z",
    "notes": "Assignment submitted successfully",
    "studentId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**File:** `src/app/api/assignments/[id]/route.ts`

---

### 3. POST /api/assignments - Create Assignment ✅

**Description:** Create a new assignment record.

**Request Body:**

```json
{
  "assignmentNumber": 1,
  "status": "PENDING",
  "completedDate": null,
  "notes": "Initial assignment",
  "studentId": "..."
}
```

**Validation:**

- `assignmentNumber`: Required, integer, between 1-10
- `status`: Optional, enum (PENDING, SUBMITTED, COMPLETED, NOT_DEFINED), default: NOT_DEFINED
- `studentId`: Required, must be valid MongoDB ObjectId
- Unique constraint: (studentId, assignmentNumber)

**Response:** (201 Created)

```json
{
  "statusCode": 201,
  "message": "Assignment created successfully",
  "data": {...}
}
```

**File:** `src/app/api/assignments/route.ts`

---

### 4. PUT /api/assignments/[id] - Update Assignment ✅

**Description:** Update assignment fields (status, completedDate, notes).

**Request Body:**

```json
{
  "status": "SUBMITTED",
  "completedDate": "2024-05-01T10:30:00Z",
  "notes": "Updated notes"
}
```

**Validation:**

- All fields are optional
- `status`: enum (PENDING, SUBMITTED, COMPLETED, NOT_DEFINED)
- `completedDate`: Date not in future
- `studentId` and `_id` are immutable

**Response:** (200 OK)

**File:** `src/app/api/assignments/[id]/route.ts`

---

### 5. DELETE /api/assignments/[id] - Delete Assignment ✅

**Description:** Remove an assignment record.

**Response:** (200 OK)

```json
{
  "statusCode": 200,
  "message": "Assignment deleted successfully",
  "data": {...}
}
```

**File:** `src/app/api/assignments/[id]/route.ts`

---

### 6. PUT /api/assignments/[id]/submit - Mark as Submitted ✅ **NEW**

**Description:** Quick endpoint to mark an assignment as SUBMITTED and auto-set completedDate.

**Path Parameters:**

- `id` (string, required) - Assignment MongoDB ObjectId

**Request Body (Optional):**

```json
{
  "completedDate": "2024-05-01T10:30:00Z"
}
```

**Behavior:**

- Sets assignment status to SUBMITTED
- Auto-sets completedDate to current time (or provided date)
- Updates Student.lastCompletedAssignment if this is higher
- Auto-updates Student.currentStatus based on progress
- Idempotent operation

**Response:** (200 OK)

```json
{
  "statusCode": 200,
  "message": "Assignment marked as submitted successfully",
  "data": {
    "_id": "...",
    "status": "SUBMITTED",
    "completedDate": "2024-05-01T10:30:00Z",
    ...
  }
}
```

**File:** `src/app/api/assignments/[id]/submit/route.ts`

---

### 7. PUT /api/assignments/[id]/complete - Mark as Completed ✅ **NEW**

**Description:** Mark an assignment as COMPLETED and cascade updates.

**Path Parameters:**

- `id` (string, required) - Assignment MongoDB ObjectId

**Request Body (Optional):**

```json
{
  "completedDate": "2024-05-01T10:30:00Z"
}
```

**Behavior:**

- Sets assignment status to COMPLETED
- Auto-sets completedDate to current time (or provided date)
- Updates Student.lastCompletedAssignment
- Auto-updates Student.currentStatus
- Updates Student.currentStatus to COMPLETED if all 10 assignments done

**Response:** (200 OK)

**File:** `src/app/api/assignments/[id]/complete/route.ts`

---

### 8. POST /api/assignments/bulk-submit - Bulk Submit by Email ✅ **NEW**

**Description:** Bulk mark assignments as submitted for multiple students using email list.

**Request Body:**

```json
{
  "assignmentNumber": 1,
  "emails": [
    "student1@example.com",
    "student2@example.com",
    "student3@example.com"
  ],
  "completedDate": "2024-05-01T10:30:00Z"
}
```

**Validation:**

- `assignmentNumber`: Required, integer, 1-10
- `emails`: Required, array of valid emails, min 1 item
- `completedDate`: Optional, date not in future

**Behavior:**

- Matches provided emails against student database
- Creates new assignments for matched students (if not exists)
- Updates existing assignments to SUBMITTED status
- Updates Student.lastCompletedAssignment if needed
- Tracks matched and unmatched emails

**Response:** (200 OK)

```json
{
  "statusCode": 200,
  "message": "Bulk submit completed successfully",
  "data": {
    "matched": {
      "count": 2,
      "students": [
        {
          "email": "student1@example.com",
          "name": "Student One",
          "id": "..."
        },
        {
          "email": "student2@example.com",
          "name": "Student Two",
          "id": "..."
        }
      ]
    },
    "unmatched": {
      "count": 1,
      "emails": ["student3@example.com"]
    },
    "created": 1,
    "updated": 1,
    "total": {
      "processed": 3,
      "successfulMatches": 2
    }
  }
}
```

**File:** `src/app/api/assignments/bulk-submit/route.ts`

---

### 9. GET /api/assignments/stats - Assignment Statistics ✅ **NEW**

**Description:** Get comprehensive assignment statistics across all students.

**Query Parameters:**

- None currently (can be extended to support date range filtering)

**Response:** (200 OK)

```json
{
  "statusCode": 200,
  "message": "Assignment statistics fetched successfully",
  "data": {
    "assignmentStats": [
      {
        "assignmentNumber": 1,
        "totalStudents": 50,
        "submitted": 45,
        "completed": 40,
        "pending": 5,
        "submissionRate": "90.00%"
      },
      {
        "assignmentNumber": 2,
        "totalStudents": 48,
        "submitted": 42,
        "completed": 35,
        "pending": 6,
        "submissionRate": "87.50%"
      },
      ...
    ],
    "averageProgress": "85.00%",
    "totalAssignmentsCompleted": 365,
    "totalSubmitted": 425,
    "totalPending": 75
  }
}
```

**File:** `src/app/api/assignments/stats/route.ts`

---

### 10. GET /api/assignments/timeline - Submission Timeline ✅ **NEW**

**Description:** Get assignment submissions grouped by date for visualization.

**Query Parameters:**

- `startDate` (ISO date, optional) - Filter from this date
- `endDate` (ISO date, optional) - Filter until this date
- `assignmentNumber` (number, 1-10, optional) - Filter by specific assignment

**Response:** (200 OK)

```json
{
  "statusCode": 200,
  "message": "Submission timeline fetched successfully",
  "data": {
    "timeline": [
      {
        "date": "2024-05-01",
        "submissions": 15
      },
      {
        "date": "2024-05-02",
        "submissions": 22
      },
      {
        "date": "2024-05-03",
        "submissions": 18
      }
    ],
    "totalSubmissions": 55
  }
}
```

**File:** `src/app/api/assignments/timeline/route.ts`

---

### 11. POST /api/students/[id]/assignments - Create Assignment for Student ✅ **NEW**

**Description:** Create a new assignment for a specific student.

**Path Parameters:**

- `id` (string, required) - Student MongoDB ObjectId

**Request Body:**

```json
{
  "assignmentNumber": 1,
  "status": "PENDING",
  "completedDate": null,
  "notes": "Initial assignment"
}
```

**Validation:**

- `assignmentNumber`: Required, integer, 1-10
- `status`: Optional, enum (PENDING, SUBMITTED, COMPLETED, NOT_DEFINED)
- Student must exist
- Unique constraint: (studentId, assignmentNumber)

**Response:** (201 Created)

**File:** `src/app/api/students/[id]/assignments/route.ts`

---

### 12. GET /api/students/[id]/progress - Student Progress Summary ✅ **NEW**

**Description:** Get comprehensive assignment progress summary for a specific student.

**Path Parameters:**

- `id` (string, required) - Student MongoDB ObjectId

**Response:** (200 OK)

```json
{
  "statusCode": 200,
  "message": "Student progress fetched successfully",
  "data": {
    "studentId": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "totalAssignments": 10,
    "submitted": 7,
    "completed": 5,
    "pending": 3,
    "percentComplete": "70%",
    "lastCompletedAssignment": "A-07",
    "nextAssignmentDue": "A-08",
    "currentStatus": "On Track",
    "assignments": [
      {
        "number": 1,
        "status": "COMPLETED",
        "completedDate": "2024-04-01",
        "notes": null
      },
      {
        "number": 2,
        "status": "SUBMITTED",
        "completedDate": "2024-04-08",
        "notes": "Submitted on time"
      },
      {
        "number": 3,
        "status": "PENDING",
        "completedDate": null,
        "notes": null
      }
    ]
  }
}
```

**File:** `src/app/api/students/[id]/progress/route.ts`

---

## Helper Functions in `/lib/assignment-logic.ts` ✅

### getCurrentActiveAssignment() ✅

- Returns current active assignment number (1-10) based on weeks elapsed from baseline date
- Baseline: 2024-01-01 (one assignment per week)

### detectFailingStudent(studentId) ✅

- Detects if student has 2+ consecutive missed assignments
- Returns: boolean

### getAssignmentsBehind(studentId) ✅

- Returns count of assignments student is behind
- Accounts for current active assignment and last completed

### estimateCompletionDate(studentId) ✅

- Estimates when student will complete all assignments
- Assumes 1.2x safety factor for completion time
- Returns: Date | null

### updateStudentStatus(studentId) ✅

- Automatically updates student status based on assignment progress
- Logic:
  - All 10 completed → COMPLETED
  - 2+ consecutive missed → AT RISK
  - Behind 2+ assignments → BEHIND
  - Otherwise → ON TRACK
- Returns: StudentStatus

### submitAssignment(assignmentId, completedDate?) ✅

- Marks assignment as SUBMITTED
- Auto-sets completedDate
- Updates Student.lastCompletedAssignment if higher
- Cascades Student.currentStatus update
- Returns: Assignment document

### completeAssignment(assignmentId, completedDate?) ✅

- Marks assignment as COMPLETED
- Auto-sets completedDate
- Updates Student.lastCompletedAssignment
- Cascades Student.currentStatus update
- Returns: Assignment document

### validateStatusProgression(currentStatus, newStatus) ✅

- Validates valid status state transitions
- Returns: boolean

### calculateAssignmentStats() ✅

- Calculates comprehensive statistics across all students
- Returns stats for each assignment (1-10)
- Includes average progress and total counts

### getSubmissionTimeline(startDate?, endDate?) ✅

- Groups submissions by date for visualization
- Returns timeline array and total submissions

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **404**: Not Found
- **409**: Conflict (duplicate assignment)
- **500**: Internal Server Error

---

## Validation

All endpoints use Zod schemas for request validation:

- **AssignmentCreateSchema**: For creating assignments
- **AssignmentUpdateSchema**: For updating assignments
- **AssignmentBulkSubmitSchema**: For bulk submit requests

---

## Database Indexes

Assignment model has the following indexes:

- Compound unique index on (studentId, assignmentNumber)
- Index on status for filtering queries

---

## Cascade Updates

When an assignment is submitted/completed:

1. Assignment status is updated
2. completedDate is set (auto or provided)
3. Student.lastCompletedAssignment is updated if applicable
4. Student.currentStatus is recalculated automatically

---

## Testing Scenarios

### Create and Submit Assignment

1. Create assignment: POST /api/students/[id]/assignments
2. Submit assignment: PUT /api/assignments/[id]/submit
3. Check progress: GET /api/students/[id]/progress

### Bulk Submit

1. POST /api/assignments/bulk-submit with multiple emails
2. Verify matched/unmatched counts
3. Confirm assignments created/updated

### Statistics

1. GET /api/assignments/stats - See overall progress
2. GET /api/assignments/timeline - See submission timeline

---

## Notes

- Assignment numbers are fixed at 1-10 (configurable via constants if needed)
- Each student can have only one assignment per number
- Dates cannot be in the future
- Status progression is validated
- All operations are logged for audit trail
