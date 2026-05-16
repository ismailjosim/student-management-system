# MentorTrack - Student Mentorship Management System

A comprehensive Next.js application for managing student mentorship programs with real-time tracking of assignments, call logs, follow-ups, and student progress. Built with modern web technologies including TypeScript, MongoDB, and Next.js App Router.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Core Modules](#-core-modules)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Student Management

- **Complete Student Roster** - View, create, update, and delete students
- **Advanced Search & Filtering** - Search by name, email, phone, or status
- **Bulk Import** - Import students via CSV/XLSX with preview and validation
- **Student Profiles** - Detailed student information with assignments, call logs, and follow-ups
- **Status Tracking** - Monitor student status (On Track, Behind, At Risk, Dropped, Completed)

### Assignment Tracking

- **10-Assignment System** - Track up to 10 assignments per student
- **Status Management** - Mark assignments as pending, completed, or overdue
- **Auto Failure Detection** - Automatically identifies students with 2+ consecutive missed assignments
- **Bulk Operations** - Submit assignments for multiple students via email list
- **Statistics** - Assignment completion rates and trends

### Call Management

- **Call Queue** - Auto-prioritized list of students needing follow-up
- **Call Logging** - Record call details with status, date, and notes
- **Call Statistics** - Analytics on call frequency, success rates, and patterns
- **Smart Prioritization** - Priority system based on overdue follow-ups and contact frequency

### Follow-up System

- **Auto Follow-ups** - Automatically creates follow-ups 7 days after calls
- **Overdue Tracking** - Identifies overdue follow-ups
- **Status Management** - Track follow-up progress (pending, completed, overdue)
- **Smart Reminders** - Dashboard shows students needing follow-up

### Dashboard & Analytics

- **Real-time Statistics** - Overall metrics and KPIs
- **Failing Students Table** - Quick view of at-risk students
- **Call Queue** - Priority-sorted students for outreach
- **Submission Distribution** - Visual chart of assignment completion
- **Assignment Statistics** - Completion trends and patterns

### Data Export

- **Excel Export** - Export call lists and student data to Excel format
- **Formatted Reports** - Professional call list exports with student details

### Authentication & Authorization

- **Secure Login** - Email and password-based authentication
- **Role-based Access** - Admin, Coordinator, and Viewer roles
- **Session Management** - 24-hour JWT-based sessions
- **Middleware Protection** - Automatic route protection and redirects

---

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB + Mongoose 9.6.2
- **Authentication**: NextAuth.js 5.0 (Beta)
- **UI Components**: Radix UI, Tabler Icons, Lucide React
- **Data Export**: ExcelJS, XLSX
- **Form Validation**: Zod
- **Package Manager**: pnpm
- **Build Tool**: Next.js built-in

---

## 📥 Installation

### Prerequisites

- **Node.js**: 18.17 or higher
- **pnpm**: 8 or higher (or npm/yarn)
- **MongoDB**: Atlas account or local instance
- **Git**: For cloning the repository

### Setup Steps

```bash
# Clone the repository
git clone <repository-url>
cd student-management-system

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local
```

---

## 🔐 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mentortrack

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Running the Application

### Development Mode

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Setup

```bash
# Initialize database with collections
pnpm db:init

# Seed sample data
pnpm db:seed

# Seed test users (admin, coordinator, viewer)
pnpm db:seed-users
```

### Other Commands

```bash
# Run TypeScript type checker
pnpm type-check

# Run ESLint
pnpm lint

# Format code with Prettier
pnpm format
```

---

## 📁 Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── api/                         # API routes
│   │   ├── students/                # Student endpoints
│   │   ├── assignments/             # Assignment endpoints
│   │   ├── call-logs/               # Call log endpoints
│   │   ├── call-queue/              # Call queue endpoint
│   │   ├── call-statistics/         # Analytics endpoints
│   │   ├── follow-ups/              # Follow-up endpoints
│   │   ├── dashboard/               # Dashboard stats
│   │   ├── export/                  # Data export endpoints
│   │   ├── health/                  # Health check
│   │   ├── seed/                    # Data seeding
│   │   └── auth/                    # Authentication routes
│   ├── auth/                        # Auth pages
│   │   ├── login/page.tsx
│   │   └── error/page.tsx
│   ├── dashboard/page.tsx           # Main dashboard
│   ├── students/page.tsx            # Student roster
│   ├── students/[id]/page.tsx       # Student detail
│   ├── students/new/page.tsx        # Create student
│   ├── students/import/page.tsx     # Import students
│   ├── bulk-update/page.tsx         # Bulk operations
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home (redirects to dashboard)
│   ├── globals.css                  # Global styles
│   └── error.tsx                    # Error boundary
│
├── components/                      # React components
│   ├── Layout/                      # Layout components (Navbar, Sidebar, etc.)
│   ├── Dashboard/                   # Dashboard components
│   ├── Students/                    # Student-related components
│   ├── Common/                      # Reusable UI components
│   ├── Form/                        # Form components and fields
│   ├── Table/                       # Table components
│   └── ui/                          # Base UI components
│
├── lib/                             # Utilities and configurations
│   ├── mongodb.ts                   # MongoDB connection (singleton)
│   ├── api-client.ts                # Typed API client
│   ├── validators.ts                # Zod validation schemas
│   ├── utils.ts                     # Helper functions
│   ├── constants.ts                 # App constants
│   ├── file-parser.ts               # CSV/XLSX parser
│   ├── export.ts                    # Excel export utilities
│   ├── follow-up-logic.ts           # Follow-up business logic
│   ├── assignment-logic.ts          # Assignment business logic
│   └── cn.ts                        # Tailwind class merger
│
├── models/                          # Mongoose schemas
│   ├── Student.ts
│   ├── Assignment.ts
│   ├── CallLog.ts
│   ├── FollowUp.ts
│   └── User.ts
│
├── interfaces/                      # TypeScript interfaces
│   ├── student.interface.ts
│   ├── assignment.interface.ts
│   ├── callLog.interface.ts
│   └── followUp.interface.ts
│
├── types/                           # Global types
│   ├── index.ts
│   └── auth.d.ts
│
├── services/                        # Business logic services
│   └── student.service.ts
│
├── auth.config.ts                   # NextAuth configuration
├── auth.ts                          # NextAuth export
└── middleware.ts                    # Request middleware

public/                             # Static assets
scripts/                            # Database scripts
├── seed.ts                          # Seed students
├── seed-users.ts                    # Seed users
└── init.ts                          # Initialize database
```

---

## 🎯 Core Modules

### Students Module

**Endpoints:**

- `GET /api/students` - Get paginated students with filters
- `GET /api/students/[id]` - Get student with all relations
- `POST /api/students` - Create new student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student
- `GET /api/students/search` - Search students
- `POST /api/students/import` - Batch import with preview
- `POST /api/students/bulk-update` - Bulk update multiple students

**Features:**

- Pagination, sorting, and filtering
- Email validation and uniqueness
- Device tracking (phone number, device model)
- Demographic data (name, division, institute)
- Academic tracking (institute division, shift)

### Assignments Module

**Endpoints:**

- `GET /api/assignments` - List with filters
- `GET /api/assignments/[id]` - Get assignment details
- `POST /api/assignments` - Create assignment
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment
- `POST /api/assignments/bulk-submit` - Submit for multiple students
- `GET /api/assignments/stats` - Assignment statistics

**Features:**

- 10 assignments per student
- Status tracking (pending, completed, overdue)
- Auto-failure detection (2+ consecutive misses)
- Due date tracking

### Call Logs Module

**Endpoints:**

- `GET /api/call-logs` - List with date range filtering
- `GET /api/call-logs/[id]` - Get call details
- `POST /api/call-logs` - Create call log
- `PUT /api/call-logs/[id]` - Update call log
- `DELETE /api/call-logs/[id]` - Delete call log

**Features:**

- Call status tracking (RECEIVED, NOT_RECEIVED, PHONE_OFF, etc.)
- Date and time logging
- Notes and outcome tracking
- Auto follow-up creation 7 days later

### Follow-ups Module

**Endpoints:**

- `GET /api/follow-ups` - List with filters
- `GET /api/follow-ups/upcoming` - Get upcoming follow-ups
- `POST /api/follow-ups` - Create follow-up
- `PUT /api/follow-ups/[id]` - Update follow-up
- `DELETE /api/follow-ups/[id]` - Delete follow-up

**Features:**

- Auto-creation after calls
- Status tracking (pending, overdue, completed)
- Due date management
- Overdue detection and alerts

### Dashboard Module

**Endpoints:**

- `GET /api/dashboard/stats` - Overall statistics
- `GET /api/dashboard/failing-students` - At-risk students
- `GET /api/call-queue` - Priority-sorted call queue
- `GET /api/call-statistics` - Call analytics

**Metrics:**

- Total students and status breakdown
- Assignment completion rates
- Call frequency and success rates
- Follow-up status

---

## 📊 Database Schema

### Student Collection

```typescript
{
  _id: ObjectId
  name: string
  email: string (unique)
  phone: string
  division: string
  institute: string
  instituteDiv: string
  shift: string
  deviceModel: string
  deviceIdentifier: string
  currentStatus: enum["On Track", "Behind", "At Risk", "Dropped", "Completed"]
  mentorshipJoiningStatus: string
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### Assignment Collection

```typescript
{
  _id: ObjectId
  studentId: ObjectId (ref: Student)
  assignmentNumber: number (1-10)
  status: enum["pending", "completed", "overdue"]
  dueDate: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### CallLog Collection

```typescript
{
  _id: ObjectId
  studentId: ObjectId (ref: Student)
  date: Date
  status: enum["RECEIVED", "NOT_RECEIVED", "PHONE_OFF", "BUSY", "INVALID_NUMBER", "DID_NOT_ANSWER"]
  outcome: string
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### FollowUp Collection

```typescript
{
  _id: ObjectId
  studentId: ObjectId (ref: Student)
  callLogId: ObjectId (ref: CallLog)
  dueDate: Date
  status: enum["pending", "overdue", "completed"]
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

### User Collection

```typescript
{
  _id: ObjectId
  email: string (unique)
  password: string (hashed)
  name: string
  role: enum["admin", "coordinator", "viewer"]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔧 Development

### Development Workflow

1. **Start Dev Server**

   ```bash
   pnpm dev
   ```

2. **Make Changes** - Edit files in `src/` directory

3. **Type Check**

   ```bash
   pnpm type-check
   ```

4. **Format Code**

   ```bash
   pnpm format
   ```

5. **Build & Test**

   ```bash
   pnpm build
   ```

### Adding New Features

1. **Create API Route** - Add handler in `src/app/api/[resource]/route.ts`
2. **Define Schema** - Add Zod validator in `src/lib/validators.ts`
3. **Create Model** - Add Mongoose model in `src/models/`
4. **Add Component** - Create React component in `src/components/`
5. **Add Page** - Create page in `src/app/[feature]/page.tsx`
6. **Type Safety** - Define interfaces in `src/interfaces/`

### Code Style

- **TypeScript** - Strict mode enabled
- **Prettier** - Automatic code formatting
- **ESLint** - Code linting with Next.js rules
- **Tailwind CSS** - Utility-first CSS framework

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: MongoDB connection failing

```
Solution:
1. Verify MONGODB_URI in .env.local
2. Check MongoDB Atlas IP whitelist
3. Ensure credentials are correct
4. Try connecting directly: mongosh <connection-string>
```

### Build Errors

**Problem**: TypeScript compilation errors

```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

**Problem**: Module not found

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Authentication Issues

**Problem**: Session not persisting

```
Solution:
1. Verify NEXTAUTH_SECRET is set in .env.local
2. Clear browser cookies
3. Check if middleware.ts is present
4. Verify auth.config.ts callbacks are correct
```

### API Errors

**Problem**: 500 errors from API

```bash
# Check server logs in development
# Verify MongoDB is running
# Check network requests in browser DevTools
```

---

## 📞 Support

For issues or questions:

1. Check this documentation first
2. Review error messages and logs
3. Verify environment variables are set correctly
4. Check MongoDB connection and data

---

## 📄 License

This project is private and restricted to authorized users only.

---

## 🎓 Version

- **Application Version**: 0.1.0
- **Schema Version**: 1.0.0
- **Last Updated**: May 16, 2026

---

## ✅ Status

**Development Status**: 🟢 **PRODUCTION READY**

All core features are implemented and functional:

- ✅ Student management and tracking
- ✅ Assignment system with auto-failure detection
- ✅ Call logging and follow-up automation
- ✅ Real-time dashboard and analytics
- ✅ Batch import and export
- ✅ Authentication and authorization
- ✅ Role-based access control
