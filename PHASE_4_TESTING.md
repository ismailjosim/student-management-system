# Phase 4: Testing Guide & Verification

## 🧪 Testing Scenarios

### 1. Basic CRUD Operations

#### Create Assignment

```bash
# Create assignment for a student
POST /api/students/{studentId}/assignments
Content-Type: application/json

{
  "assignmentNumber": 1,
  "status": "PENDING",
  "notes": "Initial assignment"
}

# Expected: 201 Created
# Response includes: _id, studentId, assignmentNumber, status, etc.
```

#### Get Assignments

```bash
# Get single assignment
GET /api/assignments/{assignmentId}

# Expected: 200 OK
# Includes populated studentId

# List with filters
GET /api/assignments?studentId={id}&status=PENDING&page=1&limit=10

# Expected: 200 OK with pagination
```

#### Update Assignment

```bash
PUT /api/assignments/{assignmentId}
Content-Type: application/json

{
  "status": "SUBMITTED",
  "notes": "Updated status"
}

# Expected: 200 OK
```

#### Delete Assignment

```bash
DELETE /api/assignments/{assignmentId}

# Expected: 200 OK
```

---

### 2. Status Transition Tests

#### Mark as Submitted

```bash
PUT /api/assignments/{assignmentId}/submit
Content-Type: application/json

{
  "completedDate": "2024-05-01T10:30:00Z"
}

# Expected: 200 OK
# Response: assignment with status="SUBMITTED", completedDate set
# Side effects: Student.lastCompletedAssignment updated, Student.currentStatus recalculated
```

#### Mark as Completed

```bash
PUT /api/assignments/{assignmentId}/complete
Content-Type: application/json

{
  "completedDate": "2024-05-02T14:20:00Z"
}

# Expected: 200 OK
# Response: assignment with status="COMPLETED", completedDate set
# Side effects: Same as submitted + check if all 10 are done
```

---

### 3. Bulk Submit Tests

#### Basic Bulk Submit

```bash
POST /api/assignments/bulk-submit
Content-Type: application/json

{
  "assignmentNumber": 1,
  "emails": [
    "student1@university.edu",
    "student2@university.edu",
    "student3@university.edu"
  ],
  "completedDate": "2024-05-01T10:00:00Z"
}

# Expected: 200 OK
# Response:
{
  "matched": {
    "count": 3,
    "students": [
      {"email": "student1@university.edu", "name": "...", "id": "..."},
      ...
    ]
  },
  "unmatched": {
    "count": 0,
    "emails": []
  },
  "created": 3,
  "updated": 0,
  "total": {
    "processed": 3,
    "successfulMatches": 3
  }
}
```

#### Bulk Submit with Unmatched Emails

```bash
POST /api/assignments/bulk-submit
Content-Type: application/json

{
  "assignmentNumber": 2,
  "emails": [
    "valid@university.edu",
    "invalid@notindatabase.com",
    "another@university.edu"
  ]
}

# Expected: 200 OK
# Response shows:
# - matched: 2 emails found
# - unmatched: 1 email not found
# - created/updated counts accurate
```

#### Bulk Submit with Duplicate Assignments

```bash
POST /api/assignments/bulk-submit
Content-Type: application/json

{
  "assignmentNumber": 1,
  "emails": [
    "student1@university.edu"  // Already has assignment 1
  ]
}

# Expected: 200 OK
# Response shows:
# - matched: 1
# - updated: 1 (instead of created)
# - created: 0
```

---

### 4. Statistics Tests

#### Get Overall Statistics

```bash
GET /api/assignments/stats

# Expected: 200 OK
# Response structure:
{
  "assignmentStats": [
    {
      "assignmentNumber": 1,
      "totalStudents": 50,
      "submitted": 45,
      "completed": 40,
      "pending": 5,
      "submissionRate": "90.00%"
    },
    // ... for assignments 2-10
  ],
  "averageProgress": "85.00%",
  "totalAssignmentsCompleted": 365,
  "totalSubmitted": 425,
  "totalPending": 75
}
```

---

### 5. Student Progress Tests

#### Get Student Progress

```bash
GET /api/students/{studentId}/progress

# Expected: 200 OK
# Response:
{
  "studentId": "...",
  "name": "John Doe",
  "email": "john@university.edu",
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
      "notes": "Submitted late"
    },
    {
      "number": 3,
      "status": "PENDING",
      "completedDate": null,
      "notes": null
    },
    // ... for all 10
  ]
}
```

---

### 6. Timeline Tests

#### Get Submission Timeline

```bash
GET /api/assignments/timeline

# Expected: 200 OK
# Response:
{
  "timeline": [
    {
      "date": "2024-04-01",
      "submissions": 5
    },
    {
      "date": "2024-04-08",
      "submissions": 8
    },
    {
      "date": "2024-04-15",
      "submissions": 12
    },
    ...
  ],
  "totalSubmissions": 425
}
```

#### Timeline with Date Range

```bash
GET /api/assignments/timeline?startDate=2024-05-01&endDate=2024-05-31

# Expected: 200 OK
# Response includes only submissions between dates
```

---

### 7. Error Handling Tests

#### Invalid Assignment Number

```bash
POST /api/students/{studentId}/assignments
{
  "assignmentNumber": 15  // Out of range
}

# Expected: 400 Bad Request
# Error: "Assignment number must be between 1 and 10"
```

#### Duplicate Assignment

```bash
POST /api/students/{studentId}/assignments
{
  "assignmentNumber": 1  // Student already has this
}

# Expected: 409 Conflict
# Error: "Assignment already exists for this student"
```

#### Invalid Student ID

```bash
GET /api/students/invalid-id/progress

# Expected: 400 Bad Request
# Error: "Invalid student ID format"
```

#### Non-existent Student

```bash
GET /api/students/507f1f77bcf86cd799439011/progress

# Expected: 404 Not Found
# Error: "Student not found"
```

#### Invalid Date Format

```bash
PUT /api/assignments/{id}/submit
{
  "completedDate": "not-a-date"
}

# Expected: 400 Bad Request
# Error: "Invalid date format"
```

#### Future Date

```bash
PUT /api/assignments/{id}/submit
{
  "completedDate": "2099-01-01"
}

# Expected: 400 Bad Request
# Error: "Date cannot be in the future"
```

#### Empty Bulk Submit Emails

```bash
POST /api/assignments/bulk-submit
{
  "assignmentNumber": 1,
  "emails": []  // Empty array
}

# Expected: 400 Bad Request
# Error: "At least one email is required"
```

#### Invalid Email in Bulk Submit

```bash
POST /api/assignments/bulk-submit
{
  "assignmentNumber": 1,
  "emails": ["not-an-email"]
}

# Expected: 400 Bad Request
# Error: "Invalid email"
```

---

## 📋 Validation Checklist

### Request Validation

- [x] Assignment number validation (1-10)
- [x] Status enum validation
- [x] Date format validation
- [x] Date not in future validation
- [x] Email format validation
- [x] Email list non-empty validation
- [x] ObjectId format validation
- [x] Student existence validation
- [x] Assignment existence validation
- [x] Duplicate assignment prevention

### Response Validation

- [x] Correct status codes (200, 201, 400, 404, 409, 500)
- [x] Proper response structure
- [x] Populated student information
- [x] Pagination metadata
- [x] Statistics accuracy
- [x] Error message clarity

### Cascade Updates

- [x] Assignment submission updates student status
- [x] Assignment completion updates student status
- [x] Student lastCompletedAssignment updates
- [x] Student currentStatus recalculation
- [x] All 10 completed sets status to "Completed"

---

## 🔍 Data Integrity Tests

### Test Case 1: Single Student Progression

```
1. Create 10 assignments (A-1 to A-10)
2. Get progress (all PENDING)
3. Submit A-1, A-2, A-3
4. Verify progress updated (3 submitted)
5. Complete A-1, A-2
6. Verify progress updated (2 completed)
7. Verify lastCompletedAssignment = A-03
8. Verify currentStatus = On Track
```

### Test Case 2: Bulk Submission

```
1. Create 5 students with 10 assignments each
2. Bulk submit A-1 for 5 students
3. Verify all 5 have A-1 = SUBMITTED
4. Verify statistics updated (5 submitted)
5. Verify each student progress shows A-1 submitted
```

### Test Case 3: Status Calculations

```
1. Create student with 10 assignments
2. Submit 9, mark 1 as PENDING
3. Verify currentStatus = "On Track"
4. Mark all 10 as COMPLETED
5. Verify currentStatus = "Completed"
```

### Test Case 4: Pagination

```
1. Create 50 assignments
2. Get list with limit=10
3. Verify page 1 has 10 items
4. Verify total=50, pages=5
5. Get page 5
6. Verify last page has correct items
```

---

## 🧮 Load Testing Scenarios

### Test with Large Student Base

```
1. Create 1000 students
2. Create 1000 assignments (100 per assignment number)
3. Bulk submit assignment 1 to 100 students
4. Get statistics (should handle quickly)
5. Get timeline (should group correctly)
```

### Test Pagination Performance

```
GET /api/assignments?page=1&limit=100
GET /api/assignments?page=10&limit=100
GET /api/assignments?page=100&limit=100

Verify response times are acceptable (<200ms)
```

---

## 📊 Sample Test Data

### Students to Create

```json
[
  {
    "name": "Alice Johnson",
    "email": "alice@university.edu",
    "phone": "+1234567890"
  },
  {
    "name": "Bob Smith",
    "email": "bob@university.edu",
    "phone": "+1234567891"
  },
  {
    "name": "Charlie Brown",
    "email": "charlie@university.edu",
    "phone": "+1234567892"
  }
]
```

### Assignments to Create per Student

```json
[
  { "assignmentNumber": 1, "status": "PENDING" },
  { "assignmentNumber": 2, "status": "PENDING" },
  { "assignmentNumber": 3, "status": "PENDING" },
  // ... up to 10
]
```

---

## ✅ Pre-Deployment Checklist

- [ ] All 7 endpoints tested manually
- [ ] Error handling verified (all 400, 404, 409 cases)
- [ ] Pagination works correctly
- [ ] Filtering works correctly
- [ ] Statistics are accurate
- [ ] Progress calculations are correct
- [ ] Cascade updates work properly
- [ ] Logging is in place
- [ ] No N+1 query problems
- [ ] Response times acceptable
- [ ] Database indexes working
- [ ] Unique constraints enforced
- [ ] Date validations working
- [ ] Email matching case-insensitive
- [ ] All endpoints documented

---

## 🐛 Known Limitations & Future Improvements

### Current Limitations

1. Timeline doesn't filter by assignmentNumber (validated but not filtered)
2. No audit trail of WHO changed WHAT
3. No email notifications on status changes
4. No deadline/reminder system
5. Statistics are computed on-demand (not cached)

### Suggested Improvements

1. Add audit logging for all changes
2. Add email notifications
3. Implement caching for statistics
4. Add timeline filtering by assignment number
5. Add batch operations endpoint
6. Add assignment deadlines
7. Add retry logic for failed submissions

---

## 🚀 Running Tests

### Using cURL

```bash
# Create student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890"}'

# Get student ID from response

# Create assignment
curl -X POST http://localhost:3000/api/students/{studentId}/assignments \
  -H "Content-Type: application/json" \
  -d '{"assignmentNumber":1}'

# Submit assignment
curl -X PUT http://localhost:3000/api/assignments/{assignmentId}/submit \
  -H "Content-Type: application/json" \
  -d '{}'

# Get progress
curl http://localhost:3000/api/students/{studentId}/progress

# Get stats
curl http://localhost:3000/api/assignments/stats
```

### Using Postman

1. Import collection from `postman-collection.json` (to be created)
2. Set environment variables (studentId, assignmentId, etc.)
3. Run full test suite
4. Check response times and assertions

### Using API Testing Tools

- ThunderClient (VS Code extension)
- REST Client (VS Code extension)
- Insomnia
- Advanced REST client
