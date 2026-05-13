# Database Schema Documentation

## Overview

This document describes the complete MongoDB schema design for the Student Management System, including models, relationships, validations, and indexes.

---

## Table of Contents

1. [Student Schema](#student-schema)
2. [Assignment Schema](#assignment-schema)
3. [Call Log Schema](#call-log-schema)
4. [Follow-Up Schema](#follow-up-schema)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Validation Rules](#validation-rules)
8. [Best Practices](#best-practices)

---

## Student Schema

### Collection Name: `students`

### Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Yes | Yes | MongoDB auto-generated ID |
| `name` | String | Yes | No | Student's full name |
| `email` | String | Yes | Yes | Student's email (lowercased) |
| `phone` | String | Yes | No | Student's phone number |
| `whatsapp` | String | No | No | WhatsApp contact number |
| `division` | String | No | No | Province/Division |
| `district` | String | No | No | District name |
| `town` | String | No | No | Town/City name |
| `livingArea` | String | No | No | Urban/Suburban/Rural |
| `occupation` | String | No | No | Student/Working/etc |
| `institute` | String | No | No | College/University name |
| `educationalBackground` | String | No | No | HSC/Intermediate/Bachelor/etc |
| `currentYear` | String | No | No | Year in current institute |
| `ageRange` | Enum | No | No | '16-17', '18-19', '20-25', '26-30', '31-40', '41-50', '50+' |
| `workingDevice` | Enum | No | No | 'Laptop', 'Desktop', 'Mobile' |
| `currentStatus` | Enum | No | No | 'On Track', 'Behind', 'At Risk', 'Dropped', 'Completed' |
| `lastCompletedAssignment` | Enum | No | No | 'A-01' to 'A-10', or 'None' |
| `mentorshipJoiningStatus` | Boolean | No | No | Has joined mentorship (default: false) |
| `callLogs` | Array[ObjectId] | No | No | References to CallLog documents |
| `assignments` | Array[ObjectId] | No | No | References to Assignment documents |
| `followUps` | Array[ObjectId] | No | No | References to FollowUp documents |
| `comments` | Array[String] | No | No | Array of comment strings |
| `createdAt` | Date | No | No | Auto-generated creation timestamp |
| `updatedAt` | Date | No | No | Auto-generated update timestamp |

### Validation Rules

- **Email**:
  - Must be a valid email format
  - Must be unique across all students
  - Automatically converted to lowercase
  - Trimmed of whitespace

- **Phone**:
  - Minimum 10 characters
  - Recommended format: +92XXXXXXXXXX or 03XXXXXXXXX

- **Name**:
  - Required
  - Minimum 1 character
  - Trimmed of whitespace

---

## Assignment Schema

### Collection Name: `assignments`

### Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Yes | Yes | MongoDB auto-generated ID |
| `assignmentNumber` | Number | Yes | No | Assignment number 1-10 |
| `status` | Enum | No | No | 'PENDING', 'SUBMITTED', 'COMPLETED', 'NOT_DEFINED' |
| `completedDate` | Date | No | No | When assignment was completed |
| `notes` | String | No | No | Additional notes about the assignment |
| `studentId` | ObjectId | Yes | No | Reference to Student |
| `createdAt` | Date | No | No | Auto-generated creation timestamp |
| `updatedAt` | Date | No | No | Auto-generated update timestamp |

### Validation Rules

- **Assignment Number**:
  - Must be an integer
  - Must be between 1 and 10 (inclusive)
  - Combined with studentId must be unique

- **Status**:
  - Valid values: 'PENDING', 'SUBMITTED', 'COMPLETED', 'NOT_DEFINED'
  - Default: 'NOT_DEFINED'

- **Student ID**:
  - Must reference a valid Student document

---

## Call Log Schema

### Collection Name: `calllogs`

### Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Yes | Yes | MongoDB auto-generated ID |
| `date` | Date | Yes | No | When the call occurred |
| `status` | Enum | Yes | No | 'RECEIVED', 'NOT_RECEIVED', 'PHONE_OFF', 'SWITCHED_OFF', 'FOREIGN_NUMBER' |
| `notes` | String | No | No | Call details/summary |
| `calledBy` | String | No | No | Name of person who called |
| `issues` | String | No | No | Problems mentioned during call |
| `promised` | String | No | No | Promise made by student |
| `studentId` | ObjectId | Yes | No | Reference to Student |
| `createdAt` | Date | No | No | Auto-generated creation timestamp |
| `updatedAt` | Date | No | No | Auto-generated update timestamp |

### Validation Rules

- **Date**:
  - Cannot be in the future
  - Validates against current timestamp

- **Status**:
  - Required field
  - Valid values: 'RECEIVED', 'NOT_RECEIVED', 'PHONE_OFF', 'SWITCHED_OFF', 'FOREIGN_NUMBER'

- **Student ID**:
  - Must reference a valid Student document

---

## Follow-Up Schema

### Collection Name: `followups`

### Fields

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Yes | Yes | MongoDB auto-generated ID |
| `date` | Date | No | No | When follow-up should occur |
| `note` | String | Yes | No | Follow-up details |
| `studentId` | ObjectId | Yes | No | Reference to Student |
| `createdAt` | Date | No | No | Auto-generated creation timestamp |
| `updatedAt` | Date | No | No | Auto-generated update timestamp |

### Validation Rules

- **Date**:
  - Optional field
  - If not provided, defaults to 7 days from current date
  - Used for scheduling purposes

- **Note**:
  - Required field
  - Minimum 1 character

- **Student ID**:
  - Must reference a valid Student document

---

## Relationships

### One-to-Many Relationships

```
Student (1) ────────────────── (Many) Assignment
  │
  ├──────────────────────────── (Many) CallLog
  │
  └──────────────────────────── (Many) FollowUp
```

### Relationship Management

- **Populating Relations**: Use `.populate()` in Mongoose queries
- **Cascade Operations**: Currently manual - consider implementing soft deletes
- **Data Integrity**: Foreign key constraints enforced at application level

### Example Query with Population

```typescript
const student = await StudentModel.findById(studentId)
  .populate('assignments')
  .populate('callLogs')
  .populate('followUps');
```

---

## Indexes

### Student Indexes

```typescript
// Compound index for filtering by email and status
StudentSchema.index({ email: 1, currentStatus: 1 });

// Index for sorting by creation date
StudentSchema.index({ createdAt: -1 });
```

### Assignment Indexes

```typescript
// Unique compound index for preventing duplicates
AssignmentSchema.index({ studentId: 1, assignmentNumber: 1 }, { unique: true });

// Index for filtering by status
AssignmentSchema.index({ status: 1 });
```

### Call Log Indexes

```typescript
// Index for querying by student
CallLogSchema.index({ studentId: 1 });

// Index for sorting by date
CallLogSchema.index({ date: -1 });
```

### Follow-Up Indexes

```typescript
// Index for querying by student
FollowUpSchema.index({ studentId: 1 });

// Index for sorting by date (for scheduling)
FollowUpSchema.index({ date: -1 });
```

---

## Validation Rules

### Global Rules

1. **Email Validation**:

   ```
   Format: ^[^\s@]+@[^\s@]+\.[^\s@]+$
   Must be unique per student
   Case-insensitive (converted to lowercase)
   ```

2. **Phone Number Validation**:

   ```
   Minimum 10 digits
   Recommended format: +92XXXXXXXXXX or 03XXXXXXXXX
   Non-digit characters are trimmed
   ```

3. **Date Validation**:

   ```
   Call logs cannot have future dates
   Follow-ups default to 7 days if not specified
   ```

4. **Enum Validation**:

   ```
   All enum fields validate strictly against predefined values
   Invalid values are rejected at schema level
   ```

### Field-Specific Rules

See individual schema sections above for detailed validation per field.

---

## Best Practices

### 1. Data Entry

- Always validate data using the provided schemas in `/lib/validators.ts`
- Use helper functions for phone number formatting
- Ensure emails are lowercase before storing

### 2. Queries

- Use indexes for filtering and sorting
- Populate only needed relationships to reduce payload
- Use pagination for large result sets

### 3. Relationships

- Maintain referential integrity - verify Student exists before creating related documents
- Consider implementing cascade delete for cleanup
- Update parent arrays when creating/deleting child documents

### 4. Performance

- Use compound indexes for common filter combinations
- Monitor index usage with MongoDB profiler
- Archive old call logs and follow-ups for better performance

### 5. Data Integrity

- Use transactions for multi-document operations when needed
- Implement audit logging for sensitive changes
- Regular backups before schema migrations

### 6. Migrations

- Always test migrations in development first
- Keep rollback procedures for each migration
- Document schema version changes in migration files
- Update this documentation after schema changes

---

## Example Usage

### Creating a Student

```typescript
import { validateStudentData } from '@/lib/validators';
import StudentModel from '@/models/Student';

const studentData = validateStudentData({
  name: 'Ahmed Khan',
  email: 'ahmed@example.com',
  phone: '03001234567',
  division: 'Sindh',
  currentStatus: 'On Track',
});

const student = await StudentModel.create(studentData);
```

### Creating an Assignment

```typescript
import { validateAssignmentData } from '@/lib/validators';
import AssignmentModel from '@/models/Assignment';

const assignmentData = validateAssignmentData({
  assignmentNumber: 1,
  status: 'PENDING',
  studentId: studentId,
});

const assignment = await AssignmentModel.create(assignmentData);
student.assignments.push(assignment._id);
await student.save();
```

### Creating a Call Log

```typescript
import { validateCallLogData } from '@/lib/validators';
import CallLogModel from '@/models/CallLog';

const callLogData = validateCallLogData({
  date: new Date(),
  status: 'RECEIVED',
  notes: 'Student is progressing well',
  studentId: studentId,
});

const callLog = await CallLogModel.create(callLogData);
student.callLogs.push(callLog._id);
await student.save();
```

---

## Support

For questions or issues related to the schema, refer to the API documentation or contact the development team.
