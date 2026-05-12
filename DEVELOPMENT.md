# Development Guide

## Getting Started

### Prerequisites

- Node.js 18.17+
- pnpm 8+
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# Install dependencies
pnpm install

# Create .env.local file
cp .env.example .env.local

# Fill in your MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mentortrack
```

### Running Development Server

```bash
pnpm dev
```

Application will be available at <http://localhost:3000>

## Project Structure

### `/src/app` - Next.js App Router

- **Pages**: Server-rendered React components for each route
- **API Routes**: RESTful API endpoints under `/api`
- **Layouts**: Root layout and nested layouts for specific sections

### `/src/components` - Reusable React Components

- **Layout/**: Header, Sidebar, Footer components
- **Dashboard/**: Dashboard-specific components
- **Students/**: Student list, detail, form components
- **Common/**: Buttons, modals, cards, spinners
- **Form/**: Reusable form fields and validation

### `/src/lib` - Utility Functions & Configurations

- **mongodb.ts**: MongoDB connection (singleton pattern)
- **utils.ts**: Helper functions (date, pagination, error handling)
- **validators.ts**: Zod schemas for input validation
- **api-client.ts**: Client-side API wrapper with typed methods
- **constants.ts**: App-wide constants and labels

### `/src/models` - Mongoose Schemas

- One file per collection
- Includes validation rules and defaults
- Uses TypeScript interfaces for type safety

### `/src/interfaces` - TypeScript Interfaces

- Separate interface for each data model
- Includes Create and Update input types
- Used for API request/response typing

## Creating API Routes

### Basic Route Handler

```typescript
// src/app/api/resources/route.ts
import { connectDB } from '@/lib/mongodb';
import { createResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const resources = await Resource.find();
    const response = createResponse(200, 'Success', resources);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      createResponse(500, 'Error'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = ResourceSchema.parse(body);

    const resource = new Resource(validatedData);
    await resource.save();

    return NextResponse.json(
      createResponse(201, 'Created', resource),
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod or MongoDB errors
    return NextResponse.json(
      createResponse(400, 'Validation error'),
      { status: 400 }
    );
  }
}
```

### Dynamic Route Handler

```typescript
// src/app/api/resources/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } }
) {
  try {
    await connectDB();
    const resource = await Resource.findById(params.id);

    if (!resource) {
      return NextResponse.json(
        createResponse(404, 'Not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(createResponse(200, 'Success', resource));
  } catch (error) {
    return NextResponse.json(
      createResponse(500, 'Error'),
      { status: 500 }
    );
  }
}
```

## Creating New Models

### 1. Create Interface

```typescript
// src/interfaces/resource.interface.ts
export interface Resource {
  _id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ResourceCreateInput {
  name: string;
  description: string;
}

export interface ResourceUpdateInput {
  name?: string;
  description?: string;
}
```

### 2. Create Mongoose Model

```typescript
// src/models/Resource.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Resource } from '@/interfaces/resource.interface';

interface ResourceDocument extends Resource, Document {}

const ResourceSchema = new Schema<ResourceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Resource ||
  mongoose.model<ResourceDocument>('Resource', ResourceSchema);
```

### 3. Create Zod Validator

```typescript
// Add to src/lib/validators.ts
import { z } from 'zod';

export const ResourceCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const ResourceUpdateSchema = ResourceCreateSchema.partial();
```

## Database Connection

### MongoDB Connection Pool

The app uses a singleton pattern to prevent connection exhaustion in serverless:

```typescript
// src/lib/mongodb.ts
let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

**Why?** Next.js creates new function instances per request. This reuses connections.

### Best Practices

- Always call `await connectDB()` at start of API routes
- Use `.populate()` to fetch referenced documents
- Add proper error handling for connection failures

## Input Validation

### Using Zod for Validation

```typescript
import { StudentCreateSchema, StudentUpdateSchema } from '@/lib/validators';
import { handleZodError } from '@/lib/utils';

// In API route
try {
  const body = await request.json();
  const validated = StudentCreateSchema.parse(body);
  // Proceed with validated data
} catch (error) {
  if (error instanceof Error && error.name === 'ZodError') {
    const errorData = handleZodError(error as any);
    return NextResponse.json(
      createResponse(400, 'Validation error', undefined, errorData.errors),
      { status: 400 }
    );
  }
}
```

## Error Handling

### Standard Response Format

```typescript
interface ApiResponse {
  statusCode: number;
  message: string;
  data?: any;
  errors?: Array<{ field?: string; message: string }>;
  timestamp: string;
}
```

### Common Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request / Validation Error
- **404**: Not Found
- **409**: Conflict (duplicate email, etc.)
- **500**: Server Error

## Code Style Guide

### TypeScript

- Use strict mode (enabled in tsconfig)
- Prefer interfaces for object shapes
- Use `as const` for constant types

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused

### File Naming

- Folders: kebab-case (`api-routes`)
- Components: PascalCase (`StudentForm.tsx`)
- Types/Interfaces: PascalCase (`Student.ts`, `student.interface.ts`)
- Utilities: camelCase (`apiClient.ts`)

### Imports

```typescript
// Group imports: external, then internal
import React from 'react';
import { Schema } from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
```

## Testing

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format
```

## Environment Variables

All variables in `.env.local` are available via `process.env`:

```typescript
const mongoUri = process.env.MONGODB_URI;
const env = process.env.ENVIRONMENT;

// Client-side accessible (NEXT_PUBLIC_ prefix)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Note**: Remove `NEXT_PUBLIC_` prefix for server-only variables.

## Performance Tips

1. **Database Queries**: Use indexes and projections

   ```typescript
   Student.find().select('name email status');
   ```

2. **API Calls**: Use `.populate()` wisely

   ```typescript
   Assignment.find().populate('studentId'); // Avoid unnecessary fields
   ```

3. **Pagination**: Always implement pagination

   ```typescript
   const { skip } = getPaginationParams(page, limit);
   await Model.find().skip(skip).limit(limit);
   ```

## Debugging

### Console Logging

```typescript
console.log('Variable:', variable);
console.error('Error:', error);
```

### Network Requests

Use browser DevTools → Network tab to inspect API calls

### MongoDB

Use MongoDB Atlas → Metrics to monitor queries

## Useful Commands

```bash
# Install dependencies
pnpm install

# Add new package
pnpm add package-name

# Add dev dependency
pnpm add -D package-name

# Start dev server
pnpm dev

# Build for production
pnpm build

# Format code
pnpm format

# Check types
pnpm type-check

# Run linter
pnpm lint
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mongoose Documentation](https://mongoosejs.com)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## Common Issues

### "Please define MONGODB_URI"

- Check `.env.local` has `MONGODB_URI` set
- Restart dev server after updating `.env.local`

### Duplicate key error

- Email is unique index - use different email in tests
- Check MongoDB Atlas for existing data

### TypeScript errors

- Run `pnpm type-check` to see all errors
- Check that all imports use correct paths

---

For API endpoint examples and detailed documentation, see [API.md](API.md)
