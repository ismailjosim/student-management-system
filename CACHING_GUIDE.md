/**

* CACHING & SKELETON LOADING IMPLEMENTATION GUIDE
*
* This file documents the comprehensive caching and skeleton loading system
* implemented across the Student Management System application.
 */

// ============================================================================
// OVERVIEW
// ============================================================================

/*
The caching system uses localStorage with time-based expiration. It includes:

1. CACHE UTILITY (src/lib/cache.ts)
   * LocalStorage-based cache with expiration
   * Cache keys for all major data types
   * Invalidation strategies for mutations
   * Batch operations and pattern clearing

2. CUSTOM HOOK (src/lib/use-cached-data.ts)
   * useCachedData<T> - Generic data fetching with cache
   * usePaginatedCachedData<T> - Pagination-aware caching
   * Refetch and invalidation capabilities

3. SKELETON COMPONENTS (src/components/Common/SkeletonLoader.tsx)
   * Skeleton - Basic animated bar
   * SkeletonTable - Table placeholder
   * SkeletonCard - Card placeholder
   * SkeletonList - List placeholder
*/

// ============================================================================
// BASIC USAGE - IMPORT CACHE
// ============================================================================

// Cache utility functions
import { cache, CACHE_KEYS, CACHE_EXPIRY } from '@/lib/cache';

// Basic operations:
// 1. Get from cache (returns null if expired)
const cachedData = cache.get<StudentWithRelations[]>(CACHE_KEYS.ALL_STUDENTS);

// 2. Set in cache
cache.set(CACHE_KEYS.ALL_STUDENTS, students, CACHE_EXPIRY.LONG);

// 3. Remove from cache
cache.remove(CACHE_KEYS.ALL_STUDENTS);

// 4. Clear all cache
cache.clear();

// ============================================================================
// USING THE CUSTOM HOOK
// ============================================================================

// Example 1: Simple data fetching with cache
import { useCachedData } from '@/lib/use-cached-data';

export function MyComponent() {
  const { data, loading, error, refetch, invalidateCache } = useCachedData(
    async () => {
      const response = await fetch('/api/students');
      return response.json();
    },
    {
      cacheKey: CACHE_KEYS.ALL_STUDENTS,
      cacheExpiry: CACHE_EXPIRY.LONG,
    }
  );

  if (loading) return <SkeletonTable rows={10} columns={5} />;
  if (error) return <ErrorAlert message={error} />;

  return <StudentsList students={data} />;
}

// ============================================================================
// SKELETON LOADING COMPONENTS
// ============================================================================

import {
  Skeleton,
  SkeletonTable,
  SkeletonCard,
  SkeletonList
} from '@/components/Common/SkeletonLoader';

// 1. Generic Skeleton - for individual elements
<Skeleton className="h-4 w-2/3" /> // Single bar
<Skeleton count={5} className="h-6" /> // Multiple bars

// 2. Table Skeleton - for data tables
<SkeletonTable rows={10} columns={5} /> // 10 rows, 5 columns
<SkeletonTable rows={3} columns={4} />

// 3. Card Skeleton - for card layouts
<SkeletonCard /> // Single card
<SkeletonCard count={3} /> // Multiple cards

// 4. List Skeleton - for lists with avatars
<SkeletonList count={5} /> // 5 list items with avatars

// ============================================================================
// CACHE KEYS AVAILABLE
// ============================================================================

// Dashboard
CACHE_KEYS.DASHBOARD_STATS        // Dashboard statistics
CACHE_KEYS.FAILING_STUDENTS       // Students at risk
CACHE_KEYS.CALL_QUEUE_STUDENTS    // Call queue

// Students
CACHE_KEYS.ALL_STUDENTS           // All students list
CACHE_KEYS.STUDENT_DETAIL(id)     // Specific student detail

// Assignments & Tracking
CACHE_KEYS.ASSIGNMENTS            // All assignments
CACHE_KEYS.ASSIGNMENT_DETAIL(id)  // Specific assignment

// Call Logs & Follow-ups
CACHE_KEYS.CALL_LOGS              // Call logs
CACHE_KEYS.FOLLOW_UPS             // Follow-ups

// Settings
CACHE_KEYS.SETTINGS               // App settings
CACHE_KEYS.CURRENT_ASSIGNMENT     // Current assignment

// Reports
CACHE_KEYS.CALL_STATISTICS        // Call analytics
CACHE_KEYS.SUBMISSION_DATA        // Submission data

// ============================================================================
// CACHE EXPIRY TIMES
// ============================================================================

CACHE_EXPIRY.SHORT      // 2 minutes - frequently changing data
CACHE_EXPIRY.MEDIUM     // 5 minutes - dashboard stats (DEFAULT)
CACHE_EXPIRY.LONG       // 15 minutes - student lists
CACHE_EXPIRY.VERY_LONG  // 30 minutes - settings

// ============================================================================
// INVALIDATION ON MUTATIONS
// ============================================================================

import {
  invalidateStudentCache,
  invalidateAssignmentCache,
  invalidateCallLogCache,
  invalidateFollowUpCache,
  clearAllCaches
} from '@/lib/cache';

// After creating/updating/deleting a student:
await studentApi.create(data);
invalidateStudentCache(studentId);

// After updating an assignment:
await assignmentApi.update(id, data);
invalidateAssignmentCache(assignmentId);

// After adding a call log:
await callLogApi.create(data);
invalidateCallLogCache();

// After adding a follow-up:
await followUpApi.create(data);
invalidateFollowUpCache();

// On logout - clear everything:
clearAllCaches();

// ============================================================================
// REAL-WORLD EXAMPLE: Students Page Implementation
// ============================================================================

/*
'use client';

import { useEffect, useState } from 'react';
import { cache, CACHE_KEYS, CACHE_EXPIRY } from '@/lib/cache';
import { SkeletonTable } from '@/components/Common/SkeletonLoader';
import { StudentsTable } from '@/components/Students/StudentsTable';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Check cache first (only for first page, no filters)
        if (currentPage === 1 && !searchQuery && !statusFilter) {
          const cached = cache.get<StudentWithRelations[]>(CACHE_KEYS.ALL_STUDENTS);
          if (cached) {
            setStudents(cached);
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const response = await studentApi.getAllPaginated(currentPage, 10);
        setStudents(response.data);

        // Cache the result
        if (currentPage === 1 && !searchQuery && !statusFilter) {
          cache.set(CACHE_KEYS.ALL_STUDENTS, response.data, CACHE_EXPIRY.LONG);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage, searchQuery, statusFilter]);

  if (loading) {
    return <SkeletonTable rows={10} columns={5} />;
  }

  return (
    <StudentsTable
      students={students}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}
*/

// ============================================================================
// BEST PRACTICES
// ============================================================================

/*

1. CACHE ONLY UNFILTERED DATA
   * Cache works best for first page without search/filters
   * Filtered queries get fresh data from API
   * Prevents showing stale filtered results

2. INVALIDATE ON MUTATIONS
   * Always call invalidation functions after create/update/delete
   * Use specific invalidation (invalidateStudentCache) not clearAllCaches
   * clearAllCaches should only be used on logout

3. USE SKELETONS FOR BETTER UX
   * Show skeletons during loading instead of spinners
   * Match skeleton layout to actual content layout
   * Improves perceived performance

4. HANDLE CACHE MISSES GRACEFULLY
   * Always have error handling for API calls
   * Cache is optional - app works without it
   * Use cache.get() and check for null

5. CHOOSE APPROPRIATE EXPIRY
   * Use SHORT (2 min) for frequently changing data (call queue)
   * Use MEDIUM (5 min) for dashboard stats
   * Use LONG (15 min) for static lists (students)
   * Use VERY_LONG (30 min) for configuration/settings

6. MONITOR CACHE SIZE
   * Use cache.getStats() to check cache usage
   * localStorage has 5-10MB limit per domain
   * Clear old data regularly
*/

// ============================================================================
// DEBUGGING
// ============================================================================

// Check cache contents
const stats = cache.getStats();
console.log('Cache entries:', stats.totalEntries);
console.log('Cache sizes:', stats.sizes);

// Check if key is cached
if (cache.exists(CACHE_KEYS.ALL_STUDENTS)) {
  console.log('Students data is cached');
}

// Manually clear specific cache
cache.remove(CACHE_KEYS.ALL_STUDENTS);

// Clear by pattern (e.g., all student details)
cache.clearByPattern('student_.*');

// ============================================================================
// MIGRATION FROM OLD CODE
// ============================================================================

// OLD - No caching
const fetchStudents = async () => {
  const response = await studentApi.getAllPaginated(page, 10);
  setStudents(response.data);
};

// NEW - With caching
const fetchStudents = async () => {
  // Try cache first
  const cached = cache.get<StudentWithRelations[]>(CACHE_KEYS.ALL_STUDENTS);
  if (cached) {
    setStudents(cached);
    return;
  }

  // Fetch from API
  const response = await studentApi.getAllPaginated(page, 10);
  setStudents(response.data);

  // Cache it
  cache.set(CACHE_KEYS.ALL_STUDENTS, response.data, CACHE_EXPIRY.LONG);
};
