# Cache Revalidation Guide

## Overview

This document explains how cache revalidation is implemented across the Student Management System for CRUD operations.

## How It Works

The application uses a **client-side caching mechanism** with automatic **invalidation on mutations**. Whenever student data is created, updated, or deleted, the cache is automatically invalidated to ensure fresh data.

## Cache Architecture

### 1. **Client-Side Cache (localStorage)**

Located in: `src/lib/cache.ts`

```typescript
// Cache keys
CACHE_KEYS = {
  ALL_STUDENTS: 'all_students',
  STUDENT_DETAIL: (id: string) => `student_${id}`,
  DASHBOARD_STATS: 'dashboard_stats',
  FAILING_STUDENTS: 'failing_students',
  CALL_QUEUE_STUDENTS: 'call_queue_students',
  // ... more keys
}

// Cache expiry times
CACHE_EXPIRY = {
  SHORT: 2 minutes,
  MEDIUM: 5 minutes,
  LONG: 15 minutes,
  VERY_LONG: 30 minutes
}
```

### 2. **Cache Invalidation Helpers**

```typescript
// Invalidate specific student and related lists
invalidateStudentCache(studentId?: string)

// Invalidate all call logs and statistics
invalidateCallLogCache()

// Invalidate all follow-ups and related data
invalidateFollowUpCache()

// Clear all caches (use sparingly)
clearAllCaches()
```

## CRUD Operations with Cache Revalidation

### ✅ CREATE Operations

#### **1. Create Single Student**

- **Endpoint**: `POST /api/students`
- **Cache Invalidation**: `invalidateStudentCache(student._id)`
- **Affected Caches**:
  - `ALL_STUDENTS`
  - `FAILING_STUDENTS`
  - `CALL_QUEUE_STUDENTS`
  - `DASHBOARD_STATS`
  - `SUBMISSION_DATA`

#### **2. Import Students (Bulk)**

- **Endpoint**: `POST /api/students/import`
- **Cache Invalidation**: `invalidateStudentCache()` (no ID needed)
- **Behavior**: Invalidates all student-related caches after bulk import/update
- **Supports**:
  - Create new students
  - Update existing students
  - Automatic deduplication

### ✅ UPDATE Operations

#### **1. Update Single Student**

- **Endpoint**: `PUT /api/students/[id]`
- **Cache Invalidation**: `invalidateStudentCache(id)`
- **Affected Fields**: Name, email, phone, address, status, etc.

#### **2. Update Student Status**

- **Endpoint**: `PUT /api/students/[id]/status`
- **Cache Invalidation**: `invalidateStudentCache(id)`
- **Status Values**: 'On Track', 'Behind', 'At Risk', 'Dropped', 'Completed'

#### **3. Bulk Update Student Status**

- **Endpoint**: `POST /api/students/bulk-update`
- **Cache Invalidation**: `invalidateStudentCache()` (if modifications > 0)
- **Behavior**: Updates multiple students in a single operation

#### **4. Add Call Log**

- **Endpoint**: `POST /api/students/[id]/call-logs`
- **Cache Invalidation**:
  - `invalidateCallLogCache()`
  - `invalidateFollowUpCache()`
  - `invalidateStudentCache(id)`
- **Side Effects**:
  - Auto-creates follow-up if configured
  - Updates student's `lastContactedAt`

### ✅ DELETE Operations

#### **1. Delete Student**

- **Endpoint**: `DELETE /api/students/[id]`
- **Cache Invalidation**: `invalidateStudentCache(id)`
- **Cascade Deletes**:
  - All assignments
  - All call logs
  - All follow-ups

## Invalidation Strategy

The application uses a **pessimistic invalidation** approach:

```typescript
CACHE_INVALIDATION_TRIGGERS = {
  updateStudent: [
    ALL_STUDENTS,           // Clear student lists
    FAILING_STUDENTS,       // Refresh failing students
    CALL_QUEUE_STUDENTS,    // Refresh call queue
    DASHBOARD_STATS,        // Refresh dashboard
    SUBMISSION_DATA         // Refresh submission stats
  ],

  addCallLog: [
    CALL_LOGS,              // Clear call logs
    CALL_STATISTICS         // Refresh statistics
  ]
}
```

**Trade-off**: Invalidates more caches than strictly necessary to ensure **data consistency** over fine-grained performance.

## Client-Side Usage

### Automatic Invalidation

Cache invalidation is **automatic** on the server side. The client automatically fetches fresh data when:

1. **After API mutations** - Always refetch affected data
2. **On cache miss** - Cache expired or doesn't exist
3. **Manual invalidation** - User triggers refresh

### Accessing Cached Data

```typescript
import { cache, CACHE_KEYS, CACHE_EXPIRY } from '@/lib/cache'

// Get cached data
const students = cache.get(CACHE_KEYS.ALL_STUDENTS)

// Store data in cache
cache.set(CACHE_KEYS.ALL_STUDENTS, data, CACHE_EXPIRY.MEDIUM)

// Check if cache exists
if (cache.exists(CACHE_KEYS.STUDENT_DETAIL('123'))) {
  // Use cached data
}

// Clear specific cache
cache.remove(CACHE_KEYS.STUDENT_DETAIL('123'))

// Clear by pattern
cache.clearByPattern('student_.*')
```

## Best Practices

### ✅ Do's

1. **Always use provided cache keys** from `CACHE_KEYS`
2. **Call invalidation functions after mutations** on the server
3. **Use appropriate expiry times** based on data freshness needs
4. **Monitor cache performance** using `cache.getStats()`
5. **Clear caches on logout** using `clearAllCaches()`

### ❌ Don'ts

1. **Don't manually manage cache keys** with hardcoded strings
2. **Don't skip invalidation after mutations** (can lead to stale data)
3. **Don't use very short expiry times** for stable data (increases server load)
4. **Don't cache sensitive data** indefinitely
5. **Don't assume cache exists** always check with `exists()` first

## Debugging

### View Cache Statistics

```typescript
const stats = cache.getStats()
console.log(`Total cached entries: ${stats.totalEntries}`)
console.log('Cache sizes:', stats.sizes)
```

### Check Cache Logs

Monitor browser console for cache-related errors:

- `Cache retrieval error`
- `Cache storage error`
- `Cache removal error`

### Clear All Caches (Emergency)

```typescript
import { clearAllCaches } from '@/lib/cache'
clearAllCaches() // Nuclear option - use cautiously
```

## Performance Considerations

### Current Approach

- **Memory Usage**: Minimal (localStorage limit is 5-10MB depending on browser)
- **Lookup Time**: O(1) - Direct key-value access
- **Invalidation Time**: O(n) where n = number of related cache keys

### Cache Sizes & Expiry Times

| Cache Type | Expiry | Size | Notes |
|-----------|--------|------|-------|
| ALL_STUDENTS | 5 min | Medium | Updated frequently |
| STUDENT_DETAIL | 5 min | Small | Individual records |
| DASHBOARD_STATS | 5 min | Small | Computed data |
| CALL_LOGS | 5 min | Medium | Growing dataset |
| CALL_STATISTICS | 5 min | Small | Aggregated data |

### Optimization Tips

1. **Lazy Load Data** - Only cache what's currently visible
2. **Pagination** - Cache pages independently if possible
3. **Monitor Size** - Use `cache.getStats()` to track growth
4. **Adjust Expiry** - Increase for stable data, decrease for volatile data

## Endpoints Summary

| Operation | Method | Endpoint | Cache Invalidation |
|-----------|--------|----------|-------------------|
| Create | POST | `/api/students` | ✅ invalidateStudentCache(id) |
| Read | GET | `/api/students` | ❌ No invalidation |
| Read | GET | `/api/students/[id]` | ❌ No invalidation |
| Update | PUT | `/api/students/[id]` | ✅ invalidateStudentCache(id) |
| Delete | DELETE | `/api/students/[id]` | ✅ invalidateStudentCache(id) |
| Status | PUT | `/api/students/[id]/status` | ✅ invalidateStudentCache(id) |
| Import | POST | `/api/students/import` | ✅ invalidateStudentCache() |
| Bulk Update | POST | `/api/students/bulk-update` | ✅ invalidateStudentCache() |
| Call Log | POST | `/api/students/[id]/call-logs` | ✅ Multiple invalidations |

## Future Improvements

Potential enhancements to consider:

1. **Server-Side Caching** - Add Redis for distributed cache
2. **Cache Versioning** - Version cache entries for better control
3. **Selective Invalidation** - Only clear necessary keys instead of patterns
4. **Real-time Updates** - Use WebSockets for push-based cache updates
5. **Compression** - Compress large cache entries to save space
6. **Analytics** - Track cache hit/miss rates to optimize strategy

## Troubleshooting

### Problem: Stale data showing after update

**Solution**:

1. Check if cache invalidation function was called
2. Verify cache key names match
3. Check browser localStorage for orphaned entries
4. Clear browser cache and reload

### Problem: Cache growing too large

**Solution**:

1. Review expiry times - consider shorter durations
2. Use `clearByPattern()` for selective cleanup
3. Implement cache size limits
4. Disable caching for non-critical data

### Problem: Performance degradation

**Solution**:

1. Check `cache.getStats()` for size
2. Monitor network requests in DevTools
3. Consider pagination for large datasets
4. Reduce expiry times to force fresh data

## References

- **Cache Implementation**: `src/lib/cache.ts`
- **Student API Routes**: `src/app/api/students/`
- **Cache Usage Example**: Check any API route POST/PUT/DELETE handlers

---

**Last Updated**: May 17, 2026
**Status**: Active & Implemented
