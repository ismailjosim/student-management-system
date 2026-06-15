# MentorTrack

MentorTrack is a multi-user student mentorship management system for tracking cohort progress, assignments, outreach calls, and scheduled follow-ups from one workspace.

Built with Next.js App Router, TypeScript, MongoDB, Better Auth, and Tailwind CSS.

## Features

### Dashboard and analytics

- Cohort-level statistics for total, active, at-risk, and completed students
- Paginated students-at-risk table and prioritized call queue
- Assignment completion statistics across assignments `A-01` through `A-10`
- Submission distribution and progress visualizations
- Skeleton loading, client caching, and mutation-based cache invalidation

### Student management

- Create, view, update, and delete student records
- Detailed student profiles with progress, assignments, call history, and follow-ups
- Search, pagination, and filters for status, progress, group, and device
- Student status tracking: `On Track`, `Behind`, `At Risk`, `Dropped`, and `Completed`
- CSV and Excel import with preview, validation, and matching
- Export filtered student and outreach data

### Assignment tracking

- Track ten assignments per student
- Assignment states: `PENDING`, `SUBMITTED`, and `COMPLETED`
- Individual and bulk assignment updates
- Match uploaded email lists before applying bulk changes
- Detect missed assignments and students falling behind
- Track the current live assignment for the cohort

### Calls and follow-ups

- Log outreach calls with status, date, and notes
- Automatically schedule a follow-up after a call
- Track pending, overdue, and completed follow-ups
- Generate a call queue from overdue follow-ups and missed released assignments
- View call statistics and export call lists

### Authentication and workspace isolation

- Email and password registration and sign-in
- Google OAuth sign-up and sign-in
- MongoDB-backed sessions powered by Better Auth
- Protected application routes with automatic login redirects
- User-owned student, call-log, and follow-up data
- Accessible password visibility controls

### Interface

- Responsive desktop and mobile navigation
- Light and dark themes
- Reusable tables, forms, cards, filters, modals, and feedback components
- Toast notifications and loading states for user actions

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn, Lucide |
| Language | TypeScript 5 |
| Database | MongoDB, Mongoose, MongoDB Node.js driver |
| Authentication | Better Auth with MongoDB adapter and Google OAuth |
| Validation | Zod |
| Charts | Recharts |
| Import and export | ExcelJS, XLSX, CSV |
| Theming | next-themes |

## Getting Started

### Requirements

- Node.js `20.9.0` or newer
- pnpm
- MongoDB Atlas or a local MongoDB server
- A Google Cloud OAuth client for Google authentication

### Installation

```bash
git clone <repository-url>
cd student-management-system
pnpm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
MONGODB_DB_NAME=student-management

BETTER_AUTH_SECRET=<long-random-secret>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

BETTER_AUTH_GOOGLE_CLIENT_ID=<google-oauth-client-id>
BETTER_AUTH_GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

Generate an authentication secret with:

```bash
openssl rand -base64 32
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google OAuth Setup

1. Open Google Cloud Console and create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a Web application.
4. Add `http://localhost:3000` as an authorized JavaScript origin.
5. Add this authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

For production, add the equivalent origin and callback using the deployed HTTPS domain, then update the auth URL environment variables.

## Commands

```bash
pnpm dev          # Start the development server
pnpm build        # Create a production build
pnpm start        # Run the production server
pnpm lint         # Run ESLint
pnpm type-check   # Run the TypeScript checker
pnpm format       # Format TypeScript, TSX, and JSON files
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/auth/login` | Email or Google sign-in |
| `/auth/register` | Email or Google account creation |
| `/dashboard` | Cohort statistics, risks, assignments, and call queue |
| `/students` | Searchable and filterable student roster |
| `/students/new` | Create a student |
| `/students/import` | Import students from CSV or Excel |
| `/students/[id]` | Student profile, tracking, calls, and follow-ups |
| `/bulk-update` | Bulk assignment, mentorship, and student updates |

## API Overview

The application exposes authenticated route handlers under `src/app/api`.

- `/api/auth/[...all]` - Better Auth endpoints
- `/api/students` - Student CRUD, search, import, matching, analysis, and bulk updates
- `/api/students/[id]/assignments` - Embedded assignment management
- `/api/call-logs` - Call-log CRUD
- `/api/follow-ups` - Follow-up CRUD, completion, and upcoming schedules
- `/api/call-queue` - Prioritized outreach queue
- `/api/assignments` - Assignment operations, bulk submission, statistics, and timeline
- `/api/dashboard` - Dashboard summaries, assignment statistics, and failing students
- `/api/settings` - Current cohort assignment settings
- `/api/export/call-list` - Outreach list export
- `/api/health` - Application and database health check

API records are scoped to the authenticated user where ownership applies.

## Project Structure

```text
src/
|-- app/
|   |-- api/                 # Next.js route handlers
|   |-- auth/                # Login, registration, and auth errors
|   |-- dashboard/           # Analytics dashboard
|   |-- students/            # Student roster, import, create, and detail pages
|   `-- bulk-update/         # Bulk workflow page
|-- components/
|   |-- auth/                # Google auth and password controls
|   |-- Dashboard/           # Dashboard cards, charts, queues, and tables
|   |-- Students/            # Student profile and tracking UI
|   |-- Layout/              # App shell and navigation
|   |-- bulk-update/         # Bulk update workflows
|   `-- ui/                  # Shared UI primitives
|-- lib/                     # Auth, database, cache, parsing, and business logic
|-- models/                  # Mongoose models
|-- services/                # Domain services
|-- interfaces/              # Domain interfaces
`-- types/                   # Shared application types
```

## Data Model

The core domain includes:

- **Student**: identity, contact, cohort information, mentorship state, progress, and embedded assignments
- **Assignment**: assignment number, state, and submission/completion date
- **CallLog**: outreach status, timestamp, and notes
- **FollowUp**: scheduled date, priority, status, and notes
- **Settings**: current active cohort assignment
- **Better Auth collections**: users, sessions, accounts, and verification records

## License

Add the project license here before public distribution.
