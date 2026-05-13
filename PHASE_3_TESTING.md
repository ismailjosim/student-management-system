# Phase 3 API Testing Guide

This guide provides examples for testing all Phase 3 API endpoints.

## Prerequisites

- Running Next.js server on `http://localhost:3000`
- MongoDB database connected
- cURL, Postman, or similar tool for testing

---

## 1. Create Students (for testing)

### Create Test Student 1

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "1234567890",
    "division": "Dhaka",
    "district": "Dhaka",
    "ageRange": "20-25",
    "currentStatus": "On Track",
    "workingDevice": "Laptop"
  }'
```

**Save the returned `_id` as `STUDENT_1_ID`**

### Create Test Student 2

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fatima Khan",
    "email": "fatima@example.com",
    "phone": "0987654321",
    "division": "Chittagong",
    "district": "Chittagong",
    "ageRange": "18-19",
    "currentStatus": "Behind",
    "workingDevice": "Mobile"
  }'
```

**Save the returned `_id` as `STUDENT_2_ID`**

### Create Test Student 3

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Karim Ahmed",
    "email": "karim@example.com",
    "phone": "5555555555",
    "division": "Dhaka",
    "district": "Gazipur",
    "ageRange": "25-26",
    "currentStatus": "At Risk",
    "workingDevice": "Desktop"
  }'
```

**Save the returned `_id` as `STUDENT_3_ID`**

---

## 2. Test GET /api/students (List with Pagination)

### Get First Page (Default Limit 10)

```bash
curl "http://localhost:3000/api/students?page=1"
```

### Get with Custom Limit

```bash
curl "http://localhost:3000/api/students?page=1&limit=5"
```

### Test Search by Name

```bash
curl "http://localhost:3000/api/students?search=Ahmed"
```

### Test Search by Email

```bash
curl "http://localhost:3000/api/students?search=ahmed@example.com"
```

### Test Filter by Status

```bash
curl "http://localhost:3000/api/students?status=On%20Track"
```

### Test Sorting

```bash
# Sort by name ascending
curl "http://localhost:3000/api/students?sortBy=name&sortOrder=asc"

# Sort by creation date descending
curl "http://localhost:3000/api/students?sortBy=createdAt&sortOrder=desc"
```

### Test Combined Filters

```bash
curl "http://localhost:3000/api/students?search=Ahmed&status=On%20Track&sortBy=name&limit=10"
```

---

## 3. Test GET /api/students/[id] (Single Student Details)

### Get Student with All Relations

```bash
curl "http://localhost:3000/api/students/{STUDENT_1_ID}"
```

Replace `{STUDENT_1_ID}` with actual ID from step 1.

### Test Invalid ID Format

```bash
curl "http://localhost:3000/api/students/invalid-id"
```

Expected: 400 Bad Request

### Test Non-existent ID

```bash
curl "http://localhost:3000/api/students/60d5ec49c1234567890abcde"
```

Expected: 404 Not Found

---

## 4. Test PUT /api/students/[id] (Update Student)

### Update Single Field

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9999999999"
  }'
```

### Update Multiple Fields

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Hassan Khan",
    "phone": "8888888888",
    "currentStatus": "Behind",
    "lastCompletedAssignment": "A-03"
  }'
```

### Test Duplicate Email Error

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fatima@example.com"
  }'
```

Expected: 409 Conflict

### Test Immutable Field Protection

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "newid123456789012345",
    "name": "New Name"
  }'
```

The `_id` should not be updated.

---

## 5. Test DELETE /api/students/[id]

### Delete a Student

```bash
# First create a test student for deletion
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Delete",
    "email": "delete@example.com",
    "phone": "1111111111"
  }' > response.json

# Extract ID from response and use it to delete
curl -X DELETE http://localhost:3000/api/students/{STUDENT_TO_DELETE_ID}
```

### Verify Cascade Delete

After deleting a student, verify that related documents are also deleted.

---

## 6. Test GET /api/students/search (Advanced Search)

### Search by Name (Case-insensitive)

```bash
curl "http://localhost:3000/api/students/search?name=ahmed"
```

### Search by Email (Exact)

```bash
curl "http://localhost:3000/api/students/search?email=ahmed@example.com"
```

### Filter by Status

```bash
curl "http://localhost:3000/api/students/search?status=On%20Track"
```

### Filter by Division

```bash
curl "http://localhost:3000/api/students/search?division=Dhaka"
```

### Filter by Age Range

```bash
curl "http://localhost:3000/api/students/search?ageRange=20-25"
```

### Filter by Device

```bash
curl "http://localhost:3000/api/students/search?workingDevice=Laptop"
```

### Multiple Filters

```bash
curl "http://localhost:3000/api/students/search?status=On%20Track&division=Dhaka&ageRange=20-25&workingDevice=Laptop&limit=10"
```

---

## 7. Test GET /api/students/[id]/assignments

### Get Student Assignments with Stats

```bash
curl "http://localhost:3000/api/students/{STUDENT_1_ID}/assignments"
```

Expected response includes:

- Array of assignments with status
- Stats (total, submitted, pending, percentage)

---

## 8. Test PUT /api/students/[id]/status

### Update Status to "Behind"

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Behind"
  }'
```

### Update Status to "At Risk"

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "At Risk"
  }'
```

### Test Invalid Status (Should Fail)

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "InvalidStatus"
  }'
```

Expected: 400 Validation Error

### Test Missing Status Field

```bash
curl -X PUT http://localhost:3000/api/students/{STUDENT_1_ID}/status \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: 400 Validation Error

---

## 9. Test POST /api/students/bulk-update

### Update Multiple Students Status

```bash
curl -X POST http://localhost:3000/api/students/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": [
      "{STUDENT_1_ID}",
      "{STUDENT_2_ID}",
      "{STUDENT_3_ID}"
    ],
    "status": "Behind"
  }'
```

### Update with Empty Array (Should Fail)

```bash
curl -X POST http://localhost:3000/api/students/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "studentIds": [],
    "status": "At Risk"
  }'
```

Expected: 400 Bad Request

---

## 10. Validation Testing

### Test Email Validation

```bash
# Invalid email format
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "phone": "1234567890"
  }'
```

Expected: 400 Validation error

### Test Phone Validation

```bash
# Phone too short
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "123"
  }'
```

Expected: 400 Validation error

### Test Required Fields

```bash
# Missing email
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "1234567890"
  }'
```

Expected: 400 Validation error

### Test Input Sanitization

```bash
# Phone with special characters (should be cleaned)
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "  Test User  ",
    "email": "  TEST@EXAMPLE.COM  ",
    "phone": "+880-123-456-7890"
  }'
```

Expected: 201 Created with sanitized data

- Name: "Test User" (whitespace trimmed)
- Email: "<test@example.com>" (lowercased)
- Phone: "8801234567890" (only digits)

---

## 11. Pagination Testing

### Test Large Dataset

Create multiple students and test pagination:

```bash
# Get page 1
curl "http://localhost:3000/api/students?page=1&limit=5"

# Get page 2
curl "http://localhost:3000/api/students?page=2&limit=5"

# Get page 3
curl "http://localhost:3000/api/students?page=3&limit=5"
```

Verify:

- Correct number of items on each page
- Total count is accurate
- Pages count is correct

### Test Invalid Page Numbers

```bash
# Page 0 (should default to 1)
curl "http://localhost:3000/api/students?page=0&limit=10"

# Negative page
curl "http://localhost:3000/api/students?page=-1&limit=10"

# Non-numeric page
curl "http://localhost:3000/api/students?page=abc&limit=10"
```

---

## 12. Edge Cases

### Test Special Characters in Name

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John O'\''Brien-Smith",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

### Test Empty Search

```bash
curl "http://localhost:3000/api/students?search="
```

Should return all students without filtering.

### Test Very Long Name

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VeryLongNameThatGoesOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOnAndOn",
    "email": "test@example.com",
    "phone": "1234567890"
  }'
```

Should accept it or validate based on schema.

---

## Postman Collection

Import this collection into Postman for easier testing:

Create a file `student-api.postman_collection.json` and import it in Postman to test all endpoints with pre-configured requests.

---

## Performance Testing

For testing with larger datasets:

```bash
# Load test - Create 100 students
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/students \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Student $i\",
      \"email\": \"student$i@example.com\",
      \"phone\": \"123456789$((i % 10))\",
      \"ageRange\": \"20-25\",
      \"currentStatus\": \"On Track\"
    }"
done
```

Then test pagination and search performance with large dataset.

---

## Expected Response Times

- GET /api/students: < 500ms (with 10k records)
- GET /api/students/[id]: < 100ms
- POST /api/students: < 200ms
- PUT /api/students/[id]: < 200ms
- DELETE /api/students/[id]: < 300ms
- GET /api/students/search: < 500ms

---

## Debugging

Enable debug logging by setting environment variables:

```bash
NODE_ENV=development npm run dev
```

This will show detailed logs for all API operations.

Check logs for:

- Request parameters
- Database operations
- Error details
- Performance metrics
