# Phase 9: Testing Guide

## Test Scenarios

### Student Import - CSV Files

#### Test 1: Valid CSV Import

**Objective**: Import valid student data from CSV
**Steps**:

1. Create CSV file with headers: `name,email,phone,whatsapp,division`
2. Add rows:

   ```
   John Doe,john@example.com,01700000000,01700000001,Dhaka
   Jane Smith,jane@example.com,01800000000,01800000001,Sylhet
   ```

3. Go to `/students` → Click "Import CSV"
4. Upload file
5. Review preview (should show 2 valid rows)
6. Click "Import Students"

**Expected Result**: ✅ 2 students created, redirects to success page

#### Test 2: CSV with Missing Required Field

**Objective**: Handle missing phone number
**Setup**: CSV with email but no phone
**Expected Result**: ❌ 1 invalid row shown with error "Phone must be at least 10 digits"

#### Test 3: CSV with Invalid Email

**Objective**: Validate email format
**Setup**: CSV with `john@invalid`
**Expected Result**: ❌ 1 invalid row shown with error "Invalid email format"

#### Test 4: CSV with Duplicate Emails

**Objective**: Detect duplicates within file
**Setup**: CSV with same email on rows 2 and 3
**Expected Result**: ⚠️ Duplicate emails section shows email with row numbers [2, 3]

#### Test 5: Empty CSV

**Objective**: Handle empty file
**Setup**: File with only headers, no rows
**Expected Result**: ❌ Error message "CSV file is empty"

#### Test 6: Large File Performance

**Objective**: Test with 1000+ rows
**Setup**: Generate CSV with 1000 valid student records
**Expected Result**: ✅ Imports all within reasonable time (<30 seconds)

### Student Import - Excel Files

#### Test 7: Valid XLSX Import

**Objective**: Import from Excel file
**Steps**:

1. Create .xlsx file with sheet "Sheet1"
2. Add headers and student data
3. Upload file
**Expected Result**: ✅ Imports successfully

#### Test 8: XLSX with Multiple Sheets

**Objective**: Test sheet selection
**Setup**: Excel with 2 sheets
**Expected Result**: ✅ Uses first sheet only

#### Test 9: XLSX with Merged Cells

**Objective**: Handle formatting
**Setup**: Excel with merged cells in header
**Expected Result**: ✅ Parses correctly (XLSX library handles this)

### File Upload UI

#### Test 10: Drag and Drop

**Objective**: Test drag/drop functionality
**Steps**:

1. Go to import page
2. Drag CSV file to drop zone
3. Observe visual feedback
**Expected Result**: ✅ File selected, shows in preview

#### Test 11: Click to Select

**Objective**: Test file picker
**Steps**:

1. Click "Choose File" button
2. Select file from system
**Expected Result**: ✅ File selector opens, selection works

#### Test 12: Unsupported File Type

**Objective**: Reject non-CSV/XLSX
**Setup**: Try to upload .txt file
**Expected Result**: ❌ Toast error: "File must be CSV or XLSX format"

#### Test 13: Oversized File

**Objective**: Reject >5MB files
**Setup**: Create 6MB file
**Expected Result**: ❌ Toast error: "File size must be under 5MB"

### Create Student Form

#### Test 14: Create Valid Student

**Objective**: Create single student
**Steps**:

1. Go to `/students/new`
2. Fill required fields
3. Click "Create Student"
**Expected Result**: ✅ Redirects to student detail page

#### Test 15: Missing Required Field

**Objective**: Validate required fields
**Steps**:

1. Leave "Name" empty
2. Click "Create Student"
**Expected Result**: ❌ Form validation error shown

#### Test 16: Invalid Email Format

**Objective**: Validate email
**Setup**: Enter "notanemail"
**Expected Result**: ❌ Error on submit: "Invalid email format"

#### Test 17: Duplicate Email

**Objective**: Check email uniqueness
**Setup**: Create student with existing email
**Expected Result**: ❌ API error: "Email already exists"

#### Test 18: Optional Fields

**Objective**: Allow optional fields
**Steps**:

1. Fill only required fields
2. Leave optional fields empty
3. Create student
**Expected Result**: ✅ Student created with optional fields as null/undefined

### Bulk Assignment Update

#### Test 19: Bulk Update with File

**Objective**: Update assignments from CSV
**Setup**: CSV with valid emails
**Expected Result**: ✅ Shows matched count and unmatched list

#### Test 20: Bulk Update Text Input

**Objective**: Update with manual email list
**Setup**: Paste emails in textarea
**Expected Result**: ✅ Processes correctly

#### Test 21: Invalid Emails in Bulk

**Objective**: Handle invalid emails
**Setup**: Mix of valid and invalid emails
**Expected Result**: ✅ Shows valid count and lists invalid ones

#### Test 22: Clear File Upload

**Objective**: Switch back to text input
**Steps**:

1. Upload file
2. Click "Clear file"
3. Use text input
**Expected Result**: ✅ File cleared, text input enabled

### Export Functionality

#### Test 23: Export Call List

**Objective**: Download call list as Excel
**Steps**:

1. Call `/api/export/call-list` or click export button
2. File downloads
3. Open in Excel
**Expected Result**: ✅ File opens correctly with data

#### Test 24: Export File Format

**Objective**: Verify file structure
**Setup**: Download call list
**Expected Result**: ✅ Contains columns: name, email, phone, whatsapp, lastCalled, etc.

#### Test 25: Export Filename

**Objective**: Check filename format
**Setup**: Download call list
**Expected Result**: ✅ Filename: `MentorTrack-CallList-YYYY-MM-DD.xlsx`

### Edge Cases & Error Handling

#### Test 26: Network Error During Upload

**Objective**: Handle connection loss
**Setup**: Upload file, disconnect network mid-request
**Expected Result**: ❌ Error message with retry option

#### Test 27: Browser Back Button During Import

**Objective**: Cancel import
**Setup**: On import wizard, click browser back
**Expected Result**: ✅ State reset, back on students page

#### Test 28: Rapid Re-submission

**Objective**: Prevent double-submit
**Setup**: Click "Create Student" multiple times quickly
**Expected Result**: ✅ Only one submission processed

#### Test 29: Very Long Name

**Objective**: Handle long text
**Setup**: Name with 500 characters
**Expected Result**: ✅ Truncates or stores with warning

#### Test 30: Special Characters in Data

**Objective**: Handle special chars
**Setup**: Data with emojis, symbols, unicode
**Expected Result**: ✅ Handles correctly

### Validation Tests

#### Test 31: Phone Number Normalization

**Objective**: Standardize phone format
**Setup**: Try various formats: 01700000000, 01-700-000-000, etc.
**Expected Result**: ✅ All normalized to 11-digit format

#### Test 32: Email Case Insensitivity

**Objective**: Normalize email case
**Setup**: Import with <EMAIL@EXAMPLE.COM>
**Expected Result**: ✅ Stored as <email@example.com>

#### Test 33: Whitespace Trimming

**Objective**: Remove leading/trailing spaces
**Setup**: Data with spaces: " John Doe "
**Expected Result**: ✅ Stored as "John Doe"

### Database Tests

#### Test 34: Verify Records in Database

**Objective**: Check data persisted
**Steps**:

1. Import students
2. Query MongoDB
**Expected Result**: ✅ Records exist with correct fields

#### Test 35: Check Indexes

**Objective**: Verify performance indexes
**Setup**: Query students
**Expected Result**: ✅ Queries use indexes (check MongoDB logs)

#### Test 36: Constraint Validation

**Objective**: Check unique constraint
**Setup**: Try to import duplicate email
**Expected Result**: ✅ Shows as duplicate, skipped

### UI/UX Tests

#### Test 37: Loading States

**Objective**: Show loading during operations
**Setup**: Perform import
**Expected Result**: ✅ Spinner shown, buttons disabled, "Importing..." text

#### Test 38: Error Messages Clarity

**Objective**: Ensure error messages are clear
**Setup**: Trigger various errors
**Expected Result**: ✅ Users understand what went wrong and how to fix

#### Test 39: Responsive Design

**Objective**: Test on mobile/tablet
**Setup**: Open pages on different device sizes
**Expected Result**: ✅ Layout adapts properly, buttons clickable

#### Test 40: Toast Notifications

**Objective**: Verify notifications appear
**Setup**: Perform actions
**Expected Result**: ✅ Success/error toasts appear and auto-dismiss

### Browser Compatibility

#### Test 41: Chrome

#### Test 42: Firefox

#### Test 43: Safari

#### Test 44: Edge

#### Test 45: Mobile Browser

**Expected Result**: ✅ All features work on all major browsers

---

## Test Data Files

### Sample Valid CSV

```csv
name,email,phone,whatsapp,division,institute,educationalBackground,currentYear
John Doe,john@example.com,01700000000,01700000001,Dhaka,BUET,CSE,3
Jane Smith,jane@example.com,01800000000,01800000001,Sylhet,SUST,EEE,2
Robert Johnson,robert@example.com,01900000000,01900000001,Chittagong,RUET,ME,4
Emily Davis,emily@example.com,02000000000,02000000001,Dhaka,DU,CSE,1
Michael Brown,michael@example.com,02100000000,02100000001,Khulna,KHUST,CE,3
```

### Sample Invalid CSV

```csv
name,email,phone
John Doe,john@invalid,123
Jane Smith,jane@example.com,
Robert Johnson,robert@example.com,01900000000
```

### Sample Bulk Update CSV

```csv
email
john@example.com
jane@example.com
robert@example.com
emily@example.com
michael@example.com
```

---

## Automated Test Cases (Jest/Vitest)

### File Parser Tests

```typescript
describe('file-parser', () => {
  test('parseCSV handles valid CSV', () => {})
  test('parseXLSX handles valid XLSX', () => {})
  test('validateStudentData rejects invalid email', () => {})
  test('formatPhoneNumber normalizes correctly', () => {})
  test('normalizeEmail converts to lowercase', () => {})
})
```

### API Tests

```typescript
describe('/api/students/import', () => {
  test('POST /api/students/import with preview', () => {})
  test('POST /api/students/import with confirmed', () => {})
  test('Rejects oversized file', () => {})
})
```

---

## Performance Benchmarks

### Import Performance Targets

- **100 rows**: <500ms
- **1,000 rows**: <3 seconds
- **10,000 rows**: <30 seconds

### Export Performance Targets

- Call list with 100 students: <200ms
- Call list with 1,000 students: <2 seconds

### API Response Times

- Preview: <1 second
- Confirmed import: <5 seconds (depends on DB)

---

## Known Limitations (Testing)

1. **Max File Size**: 5MB hardcoded
2. **Preview Limit**: Only first 10 rows shown
3. **Async Timeout**: 30 seconds max per import
4. **Rate Limiting**: Not implemented yet
5. **Audit Trail**: Not logged yet

---

## Test Results Template

### Date: ___________

### Tester: ___________

| Test # | Scenario | Status | Notes |
|--------|----------|--------|-------|
| 1 | Valid CSV Import | ✅/❌ | |
| 2 | Missing Required | ✅/❌ | |
| ... | ... | ... | ... |

**Overall**: PASS / FAIL
**Issues Found**: [List any bugs or issues]
**Recommendations**: [Any improvements needed]

---

## Regression Testing Checklist

After completing Phase 9, re-test:

- [ ] Students list page loads
- [ ] Student detail page loads
- [ ] Create assignment still works
- [ ] Call logs still work
- [ ] Follow-ups still work
- [ ] Dashboard still works
- [ ] Bulk update page still works
