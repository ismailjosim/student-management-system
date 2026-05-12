# MentorTrack - Student Mentorship Management System

A comprehensive Next.js application for managing student mentorship programs with real-time tracking of assignments, call logs, follow-ups, and student progress.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd student-management-system

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local

# Update .env.local with your MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mentortrack
ENVIRONMENT=development

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checker

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── students/           # Student endpoints
│   │   ├── assignments/        # Assignment endpoints
│   │   ├── call-logs/          # Call log endpoints
│   │   ├── follow-ups/         # Follow-up endpoints
│   │   ├── dashboard/          # Dashboard stats
│   │   └── health/             # Health check
│   ├── dashboard/              # Dashboard page
│   ├── students/               # Student management pages
│   ├── bulk-update/            # Bulk update page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── Layout/                 # Layout components
│   ├── Dashboard/              # Dashboard components
│   ├── Students/               # Student components
│   ├── Common/                 # Common components
│   └── Form/                   # Form components
├── lib/
│   ├── mongodb.ts              # MongoDB connection
│   ├── utils.ts                # Utility functions
│   ├── validators.ts           # Zod schemas
│   ├── api-client.ts           # Client-side API utilities
│   └── constants.ts            # App constants
├── models/                     # Mongoose models
│   ├── Student.ts
│   ├── Assignment.ts
│   ├── CallLog.ts
│   └── FollowUp.ts
├── interfaces/                 # TypeScript interfaces
│   ├── student.interface.ts
│   ├── assignment.interface.ts
│   ├── callLog.interface.ts
│   └── followUp.interface.ts
└── types/                      # Global types
    └── index.ts
```

## 📚 API Documentation

### Health Check

- `GET /api/health` - Check API health status

### Students

- `GET /api/students` - Get all students (pagination supported)
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Assignments

- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/[id]` - Get assignment by ID
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment

### Call Logs

- `GET /api/call-logs` - Get all call logs
- `POST /api/call-logs` - Create call log
- `GET /api/call-logs/[id]` - Get call log by ID
- `PUT /api/call-logs/[id]` - Update call log
- `DELETE /api/call-logs/[id]` - Delete call log

### Follow-ups

- `GET /api/follow-ups` - Get all follow-ups
- `POST /api/follow-ups` - Create follow-up
- `GET /api/follow-ups/[id]` - Get follow-up by ID
- `PUT /api/follow-ups/[id]` - Update follow-up
- `DELETE /api/follow-ups/[id]` - Delete follow-up

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

## 🗄️ MongoDB Collections

### Students

```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  phone: string,
  enrollmentDate: Date,
  status: 'active' | 'inactive' | 'graduated' | 'dropped',
  currentGrade?: number,
  address?: string,
  parentName?: string,
  parentPhone?: string,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Assignments

```typescript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  title: string,
  description: string,
  dueDate: Date,
  submittedDate?: Date,
  status: 'pending' | 'submitted' | 'graded' | 'overdue',
  grade?: number,
  feedback?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Call Logs

```typescript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  callDate: Date,
  duration: number,
  notes: string,
  nextCallDate?: Date,
  status: 'completed' | 'missed' | 'scheduled',
  callType: 'phone' | 'video' | 'message',
  createdAt: Date,
  updatedAt: Date
}
```

### Follow-ups

```typescript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  title: string,
  description: string,
  dueDate: Date,
  completedDate?: Date,
  priority: 'low' | 'medium' | 'high',
  status: 'pending' | 'in-progress' | 'completed',
  assignedTo?: string,
  tags?: string[],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Environment Variables

Create `.env.local` in the project root:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/mentortrack
ENVIRONMENT=development
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Database**: MongoDB, Mongoose
- **Validation**: Zod
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **File Handling**: SheetJS
- **Linting**: ESLint, Prettier

## 📝 Code Style

The project follows consistent code style enforced by:

- **Prettier**: Auto-format code (2-space indent, single quotes, 100 char line width)
- **ESLint**: Lint with Next.js core-web-vitals config

Run formatting:

```bash
pnpm format
```

Run linting:

```bash
pnpm lint
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (automatic on push to main)

```bash
# Build for production
pnpm build

# Start production server locally
pnpm start
```

## 📖 Development Guide

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development instructions.

See [API.md](API.md) for comprehensive API documentation with examples.

## 📄 License

MIT
