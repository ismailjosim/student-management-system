# Assignments Embedding Migration Guide

## Overview

This migration moves assignments from a **separate collection** to **embedded documents within the students collection**. This simplifies the data model and improves query performance for student-related data.

## What Changed

### Old Structure

```
Collections:
- students
- assignments (separate)

Student Document:
{
  _id: ObjectId,
  name: "...",
  assignments: []  // IDs only
}

Assignment Document:
{
  _id: ObjectId,
  studentId: ObjectId,
  assignmentNumber: 1,
  status: "SUBMITTED",
  submittedDate: Date,
  completedDate: Date,
  notes: String
}
```

### New Structure

```
Collections:
- students (only collection)
- assignments (deleted)

Student Document:
{
  _id: ObjectId,
  name: "...",
  assignments: [
    {
      assignmentNumber: 1,
      status: "SUBMITTED",
      date: Date  // Unified date field
    }
  ]
}
```

## Model Changes

### StudentAssignment Interface

**Before:**

```typescript
export interface StudentAssignment {
  assignment: number;           // 1-10
  status: AssignmentStatus;     // PENDING, SUBMITTED, COMPLETED
  submittedDate?: Date;
  completedDate?: Date;
}
```

**After:**

```typescript
export interface StudentAssignment {
  assignmentNumber: number;     // 1-10
  status: AssignmentStatus;     // PENDING, SUBMITTED, COMPLETED
  date?: Date;                  // Unified date field
}
```

### Validator Schema

**Before:**

```typescript
export const UpdateStudentAssignmentSchema = z.object({
  assignment: z.number().int().min(1).max(10),
  status: z.enum(['PENDING', 'SUBMITTED', 'COMPLETED']).optional(),
  completedDate: z.coerce.date().optional(),
  submittedDate: z.coerce.date().optional(),
});
```

**After:**

```typescript
export const UpdateStudentAssignmentSchema = z.object({
  assignmentNumber: z.number().int().min(1).max(10),
  status: z.enum(['PENDING', 'SUBMITTED', 'COMPLETED']).optional(),
  date: z.coerce.date().optional(),
});
```

## Migration Steps

### Step 1: Update Database Schema (Done)

✅ Student model schema updated to use new embedded structure
✅ StudentAssignment interface updated with new field names

### Step 2: Run Migration Script (Required)

The migration script reads data from the assignments collection and embeds it into students.

**Command:**

```bash
node scripts/migrate-assignments.js
```

**Options:**

```bash
# Dry run (without deleting assignments collection)
node scripts/migrate-assignments.js

# Migration with auto-deletion of assignments collection
node scripts/migrate-assignments.js --drop-collection
```

**What it does:**

1. Connects to MongoDB
2. Reads all documents from `assignments` collection
3. Groups them by `studentId`
4. Embeds each group into the respective student's `assignments` array
5. Optionally drops the empty `assignments` collection

**Example Output:**

```
✅ Connected to MongoDB
📊 Found 245 assignments to migrate
📍 Assignments grouped for 87 students
✅ Updated 87 students
✨ Migration completed successfully!

Summary:
  - Migrated: 245 assignments
  - Updated: 87 students
  - Errors: 0
```

### Step 3: Update API Endpoints

The following endpoints were updated to use the new field names:

| Endpoint | Changes |
|----------|---------|
| `POST /api/assignments` | Uses `assignmentNumber`, `date` |
| `GET /api/assignments` | Uses `assignmentNumber`, `date` |
| `PUT /api/students/[id]/assignments` | Uses `assignmentNumber`, `date` |
| `POST /api/students/[id]/assignments` | Uses `assignmentNumber`, `date` |
| `DELETE /api/students/[id]/assignments` | Uses `assignmentNumber` |

### Step 4: Backward Compatibility

The API accepts both old and new field names during the transition period:

```typescript
// Accepts both
POST /api/assignments
{
  // New format (preferred)
  "assignmentNumber": 1,
  "status": "SUBMITTED",
  "date": "2026-05-17T17:01:46.723Z"
}

// Old format (still works)
{
  "assignment": 1,
  "status": "SUBMITTED",
  "submittedDate": "2026-05-17T17:01:46.723Z"
}
```

## Benefits of This Migration

### 1. **Simplified Data Model**

- No need to maintain separate collections
- Fewer database joins required
- Reduced complexity

### 2. **Better Performance**

- Faster queries for student + assignments
- Fewer round trips to database
- Better indexing possibilities

### 3. **Consistency**

- Assignment data lives with student data
- Cascade deletes automatically work
- No orphaned assignment records

### 4. **Easier Queries**

```typescript
// Old way (required joins)
const student = await Student.findById(id);
const assignments = await Assignment.find({ studentId: id });

// New way (single query)
const student = await Student.findById(id);
const assignments = student.assignments;
```

## Important Notes

### ⚠️ Before Running Migration

1. **Backup your database**

   ```bash
   mongodump --uri="<MONGODB_URI>" --out ./backup
   ```

2. **Test in development first**
   - Run migration on dev/staging environment
   - Verify all data migrated correctly
   - Test all API endpoints

3. **Schedule during maintenance window**
   - No concurrent writes should happen
   - Inform users of maintenance

### 📋 After Running Migration

1. **Verify migration success**

   ```bash
   # Check if all assignments embedded
   db.students.find({ assignments: { $size: 0 } }).count()  // Should be low

   # Check if assignments collection is empty
   db.assignments.count()  // Should be 0 if --drop-collection used
   ```

2. **Update documentation**
   - All team members should know about new structure
   - Update any custom scripts/tools

3. **Monitor for issues**
   - Watch for any API errors in logs
   - Verify cache works correctly
   - Check for performance improvements

## Troubleshooting

### Problem: Script fails with "Cannot find module"

**Solution:**

```bash
# Install dotenv if missing
npm install dotenv

# Then run script
node scripts/migrate-assignments.js
```

### Problem: Connection timeout

**Solution:**

- Check MONGODB_URI is correct
- Verify network access to MongoDB
- Increase timeout if necessary

### Problem: Data not migrated for some students

**Solution:**

1. Run migration script again (idempotent)
2. Check logs for specific error messages
3. Verify data consistency:

   ```bash
   db.students.aggregate([
     { $match: { assignments: { $size: 0 } } }
   ])
   ```

### Problem: Want to rollback

**Solution:**

1. Restore from backup

   ```bash
   mongorestore --uri="<MONGODB_URI>" ./backup
   ```

2. Revert code changes to use old schema

## API Example Requests

### Create Assignment (New Format)

```bash
POST /api/students/123/assignments
Content-Type: application/json

{
  "assignmentNumber": 1,
  "status": "SUBMITTED",
  "date": "2026-05-17T17:01:46.723Z"
}
```

### Get Student with Assignments

```bash
GET /api/students/123

Response:
{
  "data": {
    "_id": "...",
    "name": "Md. Jubair Hossain",
    "email": "...",
    "assignments": [
      {
        "assignmentNumber": 1,
        "status": "SUBMITTED",
        "date": "2026-05-17T17:01:46.723Z"
      },
      {
        "assignmentNumber": 2,
        "status": "PENDING"
      }
    ]
  }
}
```

### Query All Assignments

```bash
GET /api/assignments?status=COMPLETED

Response:
{
  "data": [
    {
      "student": {
        "_id": "...",
        "name": "...",
        "email": "..."
      },
      "assignmentNumber": 1,
      "status": "COMPLETED",
      "date": "2026-05-17T17:01:46.723Z"
    }
  ]
}
```

## Cache Invalidation

The cache invalidation system automatically handles assignment updates:

```typescript
// When assignment is modified
invalidateStudentCache(studentId)  // Clears related caches

// Affected caches:
// - ALL_STUDENTS
// - STUDENT_DETAIL
// - DASHBOARD_STATS
// - FAILING_STUDENTS
```

## File Changes Summary

### Modified Files

1. `src/models/Student.ts` - Updated StudentAssignment interface and schema
2. `src/lib/validators.ts` - Updated UpdateStudentAssignmentSchema
3. `src/app/api/students/[id]/assignments/route.ts` - Updated field references
4. `src/app/api/assignments/route.ts` - Updated aggregation pipeline
5. `src/app/api/students/auto-detect/route.ts` - Updated field references
6. `src/app/api/students/analyze/route.ts` - Updated field references

### New Files

1. `scripts/migrate-assignments.js` - Migration script

### Optional Deletions (After Migration)

1. `src/models/Assignment.ts` - Can be deleted if not used elsewhere
2. `src/app/api/assignments/` - Can refactor to use embedded data only

## References

- **Migration Script**: `scripts/migrate-assignments.js`
- **Student Model**: `src/models/Student.ts`
- **Validators**: `src/lib/validators.ts`
- **API Routes**: `src/app/api/assignments/` and `src/app/api/students/`

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review MongoDB logs for connection issues
3. Verify data consistency using provided queries
4. Contact your database administrator if backup/restore needed

---

**Created**: May 17, 2026
**Status**: Ready for Migration
**Next Steps**: Run migration script and test thoroughly
