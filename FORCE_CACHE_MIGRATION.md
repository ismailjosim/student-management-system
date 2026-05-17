# Next.js v16 Force-Cache Migration Guide

## Overview

Your project has been successfully migrated from localStorage-based caching to **Next.js v16 `force-cache`** with `revalidateTag` for automatic cache invalidation. This provides better performance, automatic cache management, and no storage limits.

## What Changed

### Before (localStorage)

- Used browser's localStorage for caching
- Manual cache expiration handling
- Limited to 5-10MB per domain
- Cache persisted across sessions

### After (Next.js force-cache)

- Server-side caching using Next.js fetch `force-cache`
- Automatic invalidation with cache tags
- Unlimited cache size
- Efficient cache busting on mutations

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Client Components (React)                          │
│  Use: useCachedData() hook                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─── Fetches via apiClient
                   │
┌──────────────────▼──────────────────────────────────┐
│  apiClient (src/lib/api-client.ts)                  │
│  - Uses fetch() with force-cache                    │
│  - Adds cache tags for revalidation                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   ├─── Fetches with next.cache config
                   │
┌──────────────────▼──────────────────────────────────┐
│  Next.js Fetch Cache (force-cache)                  │
│  - Caches GET requests indefinitely                 │
│  - Respects cache tags for invalidation             │
│  - No middleware needed                             │
└──────────────────────────────────────────────────────┘
```

## Key Files

### 1. **`src/lib/server-cache.ts`** (NEW)

Handles server-side cache management with Next.js features.

**Features:**

- `CACHE_CONFIG`: Configuration for each data type with revalidation timing
- `serverCacheManager`: Centralized cache invalidation manager
- `CACHE_TAGS`: Tags used in fetch requests
- Integrates with `revalidateTag()` from Next.js

**Usage:**

```typescript
import { serverCacheManager, CACHE_TAGS } from '@/lib/server-cache';

// Invalidate cache after mutations
serverCacheManager.invalidateStudent(studentId);
serverCacheManager.invalidateAssignment(assignmentId);
serverCacheManager.clearAll();
```

### 2. **`src/lib/api-client.ts`** (UPDATED)

API client with force-cache support.

**Key Changes:**

- Added `FetchOptions` interface with `cacheTags` and `cacheStrategy`
- All GET requests use `cache: 'force-cache'` by default
- POST/PUT/DELETE requests use `cache: 'no-store'`
- Cache tags automatically added to requests

**Usage:**

```typescript
// Automatically cached with force-cache
const result = await apiClient.get('/api/students', {
  cacheTags: ['all-students'],
});

// Not cached
const result = await apiClient.post('/api/students', data, {
  cacheStrategy: 'no-store',
});
```

### 3. **`src/lib/cache.ts`** (UPDATED)

Maintains backward compatibility while integrating with new system.

**Changes:**

- In-memory cache still available for client components
- Invalidation functions now call `serverCacheManager`
- Added note about localStorage removal

**Functions:**

```typescript
// Client-side in-memory cache (for client components)
cache.get(key);
cache.set(key, data);
cache.remove(key);
cache.clear();

// Server-side invalidation (calls both client + server cache)
invalidateStudentCache(studentId);
invalidateAssignmentCache(assignmentId);
invalidateCallLogCache();
invalidateFollowUpCache();
clearAllCaches();
```

### 4. **`src/lib/use-cached-data.ts`** (UPDATED)

Client-side hook with documentation for new caching.

**Works with:**

- Server-side: Next.js force-cache on fetch
- Client-side: In-memory cache in this hook
- Auto-invalidation: Via cache.ts functions

## How to Use

### Server Actions (Cache Invalidation)

When you update data, use the cache invalidation functions:

```typescript
// In a Server Action or API route
'use server';

import { serverCacheManager } from '@/lib/server-cache';
import { invalidateStudentCache } from '@/lib/cache';

export async function updateStudent(id: string, data: StudentData) {
  // Update database
  const result = await db.student.update({ where: { id }, data });

  // Invalidate cache
  invalidateStudentCache(id);

  return result;
}
```

### Client Components (Fetching)

Use the `useCachedData` hook which works seamlessly:

```typescript
'use client';

import { useCachedData } from '@/lib/use-cached-data';
import { studentApi } from '@/lib/api-client';

export function StudentList() {
  const { data, loading, error } = useCachedData(
    () => studentApi.getAll(),
    {
      cacheKey: 'all_students',
      cacheExpiry: 300 // 5 minutes for in-memory cache
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data?.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  );
}
```

### API Routes (Using Cache Tags)

For custom API routes, manually add cache tags:

```typescript
// src/app/api/custom/route.ts
import { CACHE_TAGS } from '@/lib/server-cache';

export async function GET() {
  const response = await fetch(
    'https://external-api.com/data',
    {
      next: {
        tags: [CACHE_TAGS.STUDENTS, CACHE_TAGS.DASHBOARD_STATS],
        revalidate: 3600, // Revalidate every hour
      },
    }
  );

  return response.json();
}
```

## Cache Tags Reference

| Tag | Purpose | Revalidation |
|-----|---------|--------------|
| `all-students` | All students list | 10 minutes |
| `student-{id}` | Individual student | 10 minutes |
| `student-list` | Paginated student list | 10 minutes |
| `assignments` | All assignments | 10 minutes |
| `assignment-{id}` | Individual assignment | 10 minutes |
| `call-logs` | Call log entries | 3 minutes |
| `follow-ups` | Follow-up entries | 3 minutes |
| `dashboard-stats` | Dashboard statistics | 5 minutes |
| `failing-students` | Failing students list | 5 minutes |
| `settings` | App settings | 1 hour |

## Revalidation Strategies

### Automatic (By Time)

Cache revalidates based on configured `revalidateSeconds` in `CACHE_CONFIG`.

```typescript
// In server-cache.ts
DASHBOARD_STATS: {
  tag: 'dashboard-stats',
  revalidateSeconds: 300, // 5 minutes
}
```

### On-Demand (By Tag)

Invalidate specific tags when mutations occur.

```typescript
import { serverCacheManager } from '@/lib/server-cache';

// After updating a student
serverCacheManager.invalidateStudent(studentId);

// After adding a call log
serverCacheManager.invalidateCallLog();

// Clear everything
serverCacheManager.clearAll();
```

## Performance Benefits

1. **No Storage Limits**
   - localStorage: 5-10MB limit
   - force-cache: Unlimited

2. **Automatic Cache Management**
   - No manual cleanup needed
   - Tag-based invalidation is precise

3. **SEO Friendly**
   - Server-side caching improves Time to First Byte (TTFB)
   - Better for static/semi-static content

4. **Reduced Bandwidth**
   - Cache hits avoid server roundtrips
   - force-cache validated by Next.js CDN

## Migration Checklist

- [x] API client updated with force-cache
- [x] Server cache manager created
- [x] Cache tags configured for all endpoints
- [x] Invalidation functions updated
- [x] Backward compatibility maintained
- [x] No breaking changes to existing hooks

## Testing

Test the new caching system:

```bash
# Build the project
npm run build

# Check for type errors
npm run type-check

# Test locally
npm run dev
```

**Verify:**

1. Data loads from cache (no extra requests in Network tab)
2. Cache invalidates when data updates
3. No console errors related to caching
4. Performance is better (fewer network requests)

## Troubleshooting

### Cache Not Invalidating

- Check that invalidation functions are called after mutations
- Verify `revalidateTag()` is being called from serverCacheManager
- Check Network tab for cache headers

### Stale Data Showing

- Ensure `revalidateCacheTags()` is called after updates
- Check if `skip` flag is preventing refetch
- Clear browser cache with Ctrl+Shift+Delete

### Performance Issues

- Check that GET requests have `force-cache`
- Verify POST/PUT/DELETE use `no-store`
- Look at Network tab - should see `cache` field in response headers

## Configuration

To adjust cache revalidation times, edit `src/lib/server-cache.ts`:

```typescript
export const CACHE_CONFIG = {
  DASHBOARD_STATS: {
    tag: 'dashboard-stats',
    revalidateSeconds: 300, // Change this value
  },
  // ...
};
```

## Migration Complete! ✅

Your project now uses Next.js v16 `force-cache` instead of localStorage. This provides:

- ✅ Better performance (server-side caching)
- ✅ No storage limits
- ✅ Automatic invalidation with tags
- ✅ Full backward compatibility
- ✅ Zero breaking changes

**Questions?** Check the inline comments in the updated files for more details.
