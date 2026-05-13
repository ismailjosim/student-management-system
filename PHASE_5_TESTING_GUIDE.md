# 📞 Phase 5 Testing Guide

## Quick Start Testing

### Prerequisites

- API server running on `http://localhost:3000`
- MongoDB database connected
- At least one student created in the system

### Testing Tools

- cURL (command line)
- Postman (recommended)
- Insomnia
- Thunder Client (VS Code extension)

---

## Call Log Testing

### Test 1: Create a Call Log

**Purpose:** Test basic call log creation and auto-follow-up generation

**Steps:**

1. Get a student ID from your database
2. Execute the request:

```bash
curl -X POST http://localhost:3000/api/students/{studentId}/call-logs \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15T10:30:00Z",
    "status": "RECEIVED",
    "notes": "Student confirmed participation",
    "calledBy": "Test Coordinator",
    "issues": "Slow internet",
    "promised": "Will submit assignment by Jan 20"
  }'
```

**Expected Result:**

- Status code: 201 Created
- Response contains the created call log
- `nextFollowUp` field is automatically set to date + 7 days
- Student's `lastContactedAt` is updated

**Verification:**

- Check database: `db.students.findOne({_id: ObjectId("{studentId}")})` - should have `lastContactedAt` set
- Check database: `db.followups.findOne({date: { $gte: new Date("2024-01-22") }})` - should have auto-created follow-up

---

### Test 2: List Call Logs

**Purpose:** Test filtering and pagination

**Basic List:**

```bash
curl http://localhost:3000/api/call-logs
```

**Filter by Status:**

```bash
curl "http://localhost:3000/api/call-logs?status=RECEIVED&page=1&limit=10"
```

**Filter by Date Range:**

```bash
curl "http://localhost:3000/api/call-logs?startDate=2024-01-01&endDate=2024-12-31&limit=20"
```

**Expected Result:**

- Returns paginated list of call logs
- Includes `summary` with counts by status
- Each call log includes populated student info

---

### Test 3: Get Single Call Log

**Purpose:** Test retrieving individual call log details

```bash
curl http://localhost:3000/api/call-logs/{callLogId}
```

**Expected Result:**

- Status code: 200 OK
- Complete call log details with student info populated
- If ID invalid: 400 Bad Request
- If not found: 404 Not Found

---

### Test 4: Update Call Log

**Purpose:** Test updating and recalculating nextFollowUp

```bash
curl -X PUT http://localhost:3000/api/call-logs/{callLogId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "NOT_RECEIVED",
    "notes": "Phone was off, will try tomorrow"
  }'
```

**Expected Result:**

- Status code: 200 OK
- Call log updated with new values
- Other fields unchanged

**Advanced Test - Date Update:**

```bash
curl -X PUT http://localhost:3000/api/call-logs/{callLogId} \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-16T11:00:00Z"
  }'
```

**Expected Result:**

- `nextFollowUp` automatically recalculated to new date + 7 days

---

### Test 5: Delete Call Log

**Purpose:** Test deletion and student's lastContactedAt update

```bash
curl -X DELETE http://localhost:3000/api/call-logs/{callLogId}
```

**Expected Result:**

- Status code: 200 OK
- Call log removed from database
- Student's `lastContactedAt` updated to most recent remaining call's date (or null if no calls remain)

---

### Test 6: Batch Create Call Logs

**Purpose:** Test bulk import of call logs

```bash
curl -X POST http://localhost:3000/api/call-logs \
  -H "Content-Type: application/json" \
  -d '{
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
      },
      {
        "studentId": "999999999999999999999999",
        "date": "2024-01-15T12:00:00Z",
        "status": "RECEIVED"
      }
    ]
  }'
```

**Expected Result:**

- Status code: 207 Multi-Status
- `created`: 2, `failed`: 1
- `errors` array contains invalid student ID error
- Two follow-ups auto-created for successful calls

---

### Test 7: Get Student Call History

**Purpose:** Test student-specific call logs with summary statistics

```bash
curl "http://localhost:3000/api/students/{studentId}/call-logs?page=1&limit=20"
```

**Expected Result:**

- List of all call logs for the student
- Summary includes:
  - `totalCalls`
  - `lastCallDate`
  - `callsByStatus` (breakdown)
  - `averageTimesBetweenCalls`

---

## Follow-Up Testing

### Test 8: Create Follow-Up

**Purpose:** Test follow-up creation with future date validation

```bash
curl -X POST http://localhost:3000/api/follow-ups \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{studentId}",
    "date": "2024-01-22T10:30:00Z",
    "note": "Check if assignment was submitted"
  }'
```

**Expected Result:**

- Status code: 201 Created
- `status` defaults to "pending"
- `completedDate` is null

**Negative Test - Past Date:**

```bash
curl -X POST http://localhost:3000/api/follow-ups \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{studentId}",
    "date": "2024-01-01T10:30:00Z",
    "note": "This is in the past"
  }'
```

**Expected Result:**

- Status code: 400 Bad Request
- Error: "Date must be in the future"

---

### Test 9: List Follow-Ups

**Purpose:** Test filtering and auto-update of overdue status

```bash
curl "http://localhost:3000/api/follow-ups?page=1&limit=20"
```

**Filter by Status:**

```bash
curl "http://localhost:3000/api/follow-ups?status=pending"
```

**Filter by Student:**

```bash
curl "http://localhost:3000/api/follow-ups?studentId={studentId}"
```

**Expected Result:**

- Overdue follow-ups automatically have status updated to "overdue"
- Results include populated student info

---

### Test 10: Get Upcoming Follow-Ups

**Purpose:** Test upcoming follow-ups grouped by date

```bash
curl "http://localhost:3000/api/follow-ups/upcoming?daysAhead=7"
```

**Expected Result:**

- Grouped by date in format: `{ date: [followUps] }`
- "today" section contains today's follow-ups
- "upcoming" section contains future follow-ups
- Stats show total, today count, upcoming count

---

### Test 11: Update Follow-Up (Reschedule)

**Purpose:** Test rescheduling follow-ups

```bash
curl -X PUT http://localhost:3000/api/follow-ups/{followUpId} \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-25T10:30:00Z",
    "note": "Rescheduled - student requested later date"
  }'
```

**Expected Result:**

- Status code: 200 OK
- Follow-up rescheduled to new date
- Status remains "pending" if not changed

---

### Test 12: Mark Follow-Up Complete

**Purpose:** Test completion marking with timestamp

```bash
curl -X PUT http://localhost:3000/api/follow-ups/{followUpId}/complete \
  -H "Content-Type: application/json"
```

**Expected Result:**

- Status code: 200 OK
- `status` changed to "completed"
- `completedDate` set to current time
- Returns updated follow-up

**Custom Completion Time:**

```bash
curl -X PUT http://localhost:3000/api/follow-ups/{followUpId}/complete \
  -H "Content-Type: application/json" \
  -d '{
    "completedDate": "2024-01-22T15:30:00Z"
  }'
```

---

### Test 13: Delete Follow-Up

**Purpose:** Test follow-up deletion

```bash
curl -X DELETE http://localhost:3000/api/follow-ups/{followUpId}
```

**Expected Result:**

- Status code: 200 OK
- Follow-up removed from database

---

### Test 14: Get Student Follow-Ups

**Purpose:** Test student-specific follow-ups with scheduling info

```bash
curl "http://localhost:3000/api/students/{studentId}/follow-ups"
```

**With Completed:**

```bash
curl "http://localhost:3000/api/students/{studentId}/follow-ups?includeCompleted=true"
```

**Expected Result:**

- List of follow-ups for student
- `nextScheduled` shows the next pending follow-up
- `lastCompleted` shows most recent completed follow-up

---

## Analytics & Queue Testing

### Test 15: Get Call Queue

**Purpose:** Test dynamic call queue generation and prioritization

```bash
curl "http://localhost:3000/api/call-queue?limit=50"
```

**Expected Result:**

- Priority sorted list (high priority first)
- Each student includes:
  - Contact info (name, email, phone, whatsapp)
  - `lastCall` details
  - `nextFollowUp` date
  - `overdueFollowUp` if exists
  - `priority` level
- Stats show high/normal priority counts

**Verification:**

- High priority students should have overdue follow-ups
- Students should be sorted by last call date

---

### Test 16: Get Call Statistics

**Purpose:** Test comprehensive analytics

```bash
curl http://localhost:3000/api/call-statistics
```

**Expected Result:**

- `totalCalls`: Total number of call logs
- `callsThisWeek`: Calls made in last 7 days
- `callsByStatus`: Breakdown by status
- `successRate`: Percentage of RECEIVED calls
- `averageCallsPerStudent`: Total calls / students with calls
- `studentsNeverCalled`: Count of students with no calls
- `avgDaysBetweenCalls`: Average gap between calls
- `reachability`: Counts in high/medium/low categories

**Verification:**

- Success rate should be: (RECEIVED count / total calls) * 100
- High reachability should equal RECEIVED count
- Medium should equal NOT_RECEIVED count
- Low should equal sum of PHONE_OFF + SWITCHED_OFF + FOREIGN_NUMBER

---

## Error Handling Tests

### Test 17: Invalid ObjectId

**Purpose:** Test validation of MongoDB ObjectIds

```bash
curl http://localhost:3000/api/call-logs/invalid-id
```

**Expected Result:**

- Status code: 400 Bad Request
- Error: "Invalid call log ID"

---

### Test 18: Non-existent Resource

**Purpose:** Test 404 handling

```bash
curl http://localhost:3000/api/call-logs/507f1f77bcf86cd799999999
```

**Expected Result:**

- Status code: 404 Not Found
- Error: "Call log not found"

---

### Test 19: Non-existent Student

**Purpose:** Test student validation

```bash
curl -X POST http://localhost:3000/api/students/507f1f77bcf86cd799999999/call-logs \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15T10:30:00Z", "status": "RECEIVED"}'
```

**Expected Result:**

- Status code: 404 Not Found
- Error: "Student not found"

---

### Test 20: Invalid Status Enum

**Purpose:** Test enum validation

```bash
curl -X POST http://localhost:3000/api/students/{studentId}/call-logs \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15T10:30:00Z", "status": "INVALID_STATUS"}'
```

**Expected Result:**

- Status code: 400 Bad Request
- Error details about valid status values

---

### Test 21: Future Date for Call Log

**Purpose:** Test date validation

```bash
curl -X POST http://localhost:3000/api/students/{studentId}/call-logs \
  -H "Content-Type: application/json" \
  -d '{"date": "2099-01-15T10:30:00Z", "status": "RECEIVED"}'
```

**Expected Result:**

- Status code: 400 Bad Request
- Error: "Date cannot be in the future"

---

## Performance Testing

### Test 22: Large Pagination

**Purpose:** Test pagination with large datasets

```bash
curl "http://localhost:3000/api/call-logs?page=100&limit=50"
```

**Expected Result:**

- Returns empty array if no data on that page
- Pagination info shows correct total

---

### Test 23: Complex Filtering

**Purpose:** Test multiple filters combined

```bash
curl "http://localhost:3000/api/call-logs?status=RECEIVED&calledBy=John&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10"
```

**Expected Result:**

- Correctly filtered results
- All filters applied

---

## Integration Testing

### Scenario 1: Complete Call Workflow

1. Create a call log for a student
2. Verify follow-up auto-created (+7 days)
3. Check call queue (student appears with pending follow-up)
4. Get call statistics (numbers updated)
5. Complete the follow-up
6. Verify statistics updated

### Scenario 2: Overdue Follow-Up Workflow

1. Create a follow-up with past date (manually in DB or via old call log)
2. List follow-ups - status should be "overdue"
3. Get call queue - student should be high priority
4. Complete the overdue follow-up
5. Check that it's no longer high priority

### Scenario 3: Batch Import

1. Create 10+ call logs via batch endpoint
2. Verify all created successfully
3. Check that follow-ups auto-created for all
4. Verify student lastContactedAt updated for all
5. Check call statistics reflect the new calls

---

## Postman Collection Template

```json
{
  "info": {
    "name": "Phase 5 - Call Logs & Follow-ups",
    "description": "Complete API testing for call management"
  },
  "item": [
    {
      "name": "Call Logs",
      "item": [
        {
          "name": "List Call Logs",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/call-logs?page=1&limit=10"
          }
        },
        {
          "name": "Create Call Log",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/students/{{studentId}}/call-logs",
            "body": {
              "raw": "{\"date\": \"2024-01-15T10:30:00Z\", \"status\": \"RECEIVED\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Follow-ups",
      "item": [
        {
          "name": "List Follow-ups",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/follow-ups?status=pending"
          }
        },
        {
          "name": "Get Upcoming",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/follow-ups/upcoming?daysAhead=7"
          }
        }
      ]
    },
    {
      "name": "Analytics",
      "item": [
        {
          "name": "Call Queue",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/call-queue"
          }
        },
        {
          "name": "Call Statistics",
          "request": {
            "method": "GET",
            "url": "http://localhost:3000/api/call-statistics"
          }
        }
      ]
    }
  ]
}
```

---

## Success Criteria Checklist

- [ ] All CRUD operations working for call logs
- [ ] All CRUD operations working for follow-ups
- [ ] Auto follow-up creation on call log create
- [ ] Auto lastContactedAt update on call log create/delete
- [ ] nextFollowUp recalculation on call log date update
- [ ] Overdue status auto-update on follow-up list
- [ ] Call queue prioritization working correctly
- [ ] Call statistics calculations accurate
- [ ] Pagination working on all endpoints
- [ ] Filtering working on all endpoints
- [ ] Error handling for invalid inputs
- [ ] 404 responses for non-existent resources
- [ ] Batch operations with partial success
- [ ] Status code correctness (200, 201, 207, 400, 404)
- [ ] Response format consistency

---

## Troubleshooting

### Issue: Follow-ups not auto-created

- Check that call log creation returns 201
- Verify the response includes nextFollowUp date
- Check database for follow-up records

### Issue: Student lastContactedAt not updating

- Verify call log created successfully
- Check student document directly in database
- Ensure database indexes are created

### Issue: Call queue empty

- Create some call logs first
- Verify follow-ups exist and some are overdue
- Check call statistics to see if calls registered

### Issue: Pagination not working

- Check page and limit parameters are numbers
- Verify limit is not > 100
- Check total count in pagination response

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are 24-character hex strings
- Replace `{studentId}`, `{callLogId}`, `{followUpId}` with actual IDs
- Use `{{variable}}` syntax in Postman to reuse IDs
