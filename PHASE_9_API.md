# Phase 9 API Endpoints - Documentation

## New Endpoints (Phase 9)

### 1. Student Import

#### `POST /api/students/import`

Import students from CSV or Excel files.

**Request**:

```
Method: POST
Content-Type: multipart/form-data

Body:
{
  file: File (CSV or XLSX),
  previewOnly?: 'true' | 'false', // default: false
  confirmed?: 'true' | 'false'    // required for actual import
}
```

**Response (Preview Mode)**:

```json
{
  "preview": true,
  "headers": ["name", "email", "phone", "whatsapp", "division"],
  "totalRows": 45,
  "validCount": 42,
  "invalidCount": 2,
  "duplicateCount": 1,
  "validRows": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "01700000000",
      "whatsapp": "01700000001",
      "division": "Dhaka",
      "rowIndex": 0
    }
  ],
  "invalidRows": [
    {
      "rowIndex": 2,
      "data": {"name": "Jane", "email": "invalid"},
      "errors": ["Invalid email format"]
    }
  ],
  "duplicateEmails": [
    {
      "email": "robert@example.com",
      "rowIndices": [5, 12]
    }
  ],
  "message": "File has validation errors"
}
```

**Response (Confirmed Import)**:

```json
{
  "success": true,
  "summary": {
    "totalProcessed": 42,
    "created": 38,
    "updated": 4,
    "skipped": 3,
    "createdIds": [
      "507f1f77bcf86cd799439011",
      "507f1f77bcf86cd799439012",
      "..."
    ]
  },
  "message": "Imported 38 new students, updated 4 existing students"
}
```

**Status Codes**:

- `200`: Success
- `400`: Bad request (no file, invalid format)
- `413`: File too large (>5MB)
- `500`: Server error

**File Constraints**:

- Format: `.csv` or `.xlsx`
- Max Size: 5MB
- Max Rows: 10,000 (soft limit)

**Required CSV Headers** (case-insensitive):

- `name` (required)
- `email` (required)
- `phone` (required)
- `whatsapp` (optional)
- `division` (optional)
- `institute` (optional)
- `educationalBackground` (optional)
- `currentYear` (optional)

**Validation Rules**:

- Name: 2+ characters
- Email: Valid email format, unique in database
- Phone: 10+ digits
- WhatsApp: 10+ digits (optional)

**Example Request** (curl):

```bash
curl -X POST http://localhost:3000/api/students/import \
  -F "file=@students.csv" \
  -F "previewOnly=true"

curl -X POST http://localhost:3000/api/students/import \
  -F "file=@students.csv" \
  -F "confirmed=true"
```

---

### 2. Export Call List

#### `GET /api/export/call-list`

Export call queue as Excel file.

**Request**:

```
Method: GET
Content-Type: application/json
```

**Response**:

```
Status: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="MentorTrack-CallList-2026-05-13.xlsx"

[Binary Excel file content]
```

**Excel Columns**:

1. Name
2. Email
3. Phone
4. WhatsApp
5. Last Called (date)
6. Current Status
7. Division
8. Institute

**Example Call List Data**:

| Name | Email | Phone | WhatsApp | Last Called | Current Status | Division | Institute |
|------|-------|-------|----------|------------|-----------------|----------|-----------|
| John Doe | <john@example.com> | 01700000000 | 01700000001 | May 10, 2026 | On Track | Dhaka | BUET |
| Jane Smith | <jane@example.com> | 01800000000 | 01800000001 | May 8, 2026 | Behind | Sylhet | SUST |

**Example Request** (browser):

```javascript
fetch('/api/export/call-list')
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'call-list.xlsx';
    a.click();
  });
```

**File Format**:

- Format: XLSX (Excel)
- Filename: `MentorTrack-CallList-YYYY-MM-DD.xlsx`
- Auto-downloads to user's default download folder

---

### 3. Updated Endpoints

#### `POST /api/assignments/bulk-submit` (Enhanced)

**New Features**:

- File upload support (CSV/XLSX)
- Email validation from file
- Two-phase: preview + confirm

**Request (Preview)**:

```json
{
  "file": File,
  "assignmentNumber": 8,
  "previewOnly": true
}
```

**Response (Preview)**:

```json
{
  "preview": true,
  "matched": [
    {
      "email": "john@example.com",
      "name": "John Doe",
      "id": "507f1f77bcf86cd799439011",
      "status": "PENDING"
    }
  ],
  "unmatched": [
    {
      "email": "unknown@example.com",
      "reason": "Student not found"
    }
  ],
  "matchedCount": 42,
  "unmatchedCount": 3,
  "total": 45
}
```

**Request (Confirmed)**:

```json
{
  "file": File,
  "assignmentNumber": 8,
  "confirmed": true
}
```

**Response (Confirmed)**:

```json
{
  "success": true,
  "updated": 42,
  "failed": 0,
  "message": "Successfully updated 42 students for assignment 8"
}
```

---

## Related Endpoints (Existing)

### Student Management

- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student detail
- `POST /api/students` - Create single student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Assignment Management

- `GET /api/assignments` - List assignments
- `GET /api/assignments/:id` - Get assignment
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/:id` - Update assignment

### Call Logs

- `GET /api/call-logs` - List call logs
- `POST /api/call-logs` - Create call log
- `DELETE /api/call-logs/:id` - Delete call log

### Follow-ups

- `GET /api/follow-ups` - List follow-ups
- `POST /api/follow-ups` - Create follow-up
- `DELETE /api/follow-ups/:id` - Delete follow-up

---

## Error Handling

### Common Error Responses

**Invalid File Type**:

```json
{
  "error": "File must be CSV or XLSX format"
}
```

**File Too Large**:

```json
{
  "error": "File size must be under 5MB"
}
```

**Database Error**:

```json
{
  "error": "Email already exists"
}
```

**Network/Server Error**:

```json
{
  "error": "Failed to import students"
}
```

---

## Rate Limiting

Currently **not implemented**. Recommended limits:

- Import: 10 requests/minute per IP
- Export: 100 requests/minute per IP
- Bulk operations: 5 requests/minute per user

---

## Data Formats

### Student Import Data

```typescript
{
  name: string,           // Required, 2+ chars
  email: string,          // Required, valid email
  phone: string,          // Required, 10+ digits
  whatsapp?: string,      // Optional, 10+ digits
  division?: string,      // Optional
  institute?: string,     // Optional
  educationalBackground?: string,
  currentYear?: string,   // Optional, "1"-"4"
  group?: string,
  workingDevice?: string,
}
```

### Call List Export

```typescript
{
  name: string,
  email: string,
  phone: string,
  whatsapp: string,
  lastCalled: string,     // Date format: "Month DD, YYYY"
  currentStatus: string,  // "On Track", "Behind", "At Risk", "Dropped", "Completed"
  division: string,
  institute: string,
}
```

---

## Examples

### Example 1: Import Students from CSV

**Step 1: Preview**

```javascript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('previewOnly', 'true');

const preview = await fetch('/api/students/import', {
  method: 'POST',
  body: formData
}).then(r => r.json());

console.log(`${preview.validCount} valid, ${preview.invalidCount} invalid`);
```

**Step 2: Confirm & Import**

```javascript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('confirmed', 'true');

const result = await fetch('/api/students/import', {
  method: 'POST',
  body: formData
}).then(r => r.json());

console.log(`Created ${result.summary.created} students`);
```

### Example 2: Export Call List

**Using JavaScript**:

```javascript
const response = await fetch('/api/export/call-list');
const blob = await response.blob();

// Download
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'call-list.xlsx';
document.body.appendChild(a);
a.click();
window.URL.revokeObjectURL(url);
document.body.removeChild(a);
```

**Using cURL**:

```bash
curl -o call-list.xlsx http://localhost:3000/api/export/call-list
```

### Example 3: Bulk Update Assignments

```javascript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('assignmentNumber', '8');

// Preview
const preview = await fetch('/api/assignments/bulk-submit', {
  method: 'POST',
  body: formData,
  // Add previewOnly parameter somehow (depends on implementation)
}).then(r => r.json());

// Confirm
formData.append('confirmed', 'true');
const result = await fetch('/api/assignments/bulk-submit', {
  method: 'POST',
  body: formData
}).then(r => r.json());
```

---

## Migration from Phase 8

No breaking changes. All existing endpoints work as before.

New endpoints:

- ✅ `POST /api/students/import` (new)
- ✅ `GET /api/export/call-list` (new)

Enhanced endpoints:

- ⚠️ `POST /api/assignments/bulk-submit` (now supports file upload)

---

## Future Enhancements (Phase 10+)

- [ ] Batch import with job queue
- [ ] Export multiple formats (PDF, JSON)
- [ ] Scheduled exports (email)
- [ ] Import history/audit
- [ ] Custom field mapping
- [ ] Data transformation pipeline
- [ ] Rate limiting
- [ ] Webhook support
- [ ] GraphQL API
