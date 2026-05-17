/**
 * Next.js v16 Server-Side Caching with force-cache and revalidation
 * Uses Next.js fetch caching instead of localStorage
 */

import { revalidateTag } from 'next/cache';

/**
 * In-memory cache for client-side usage (mirrors server cache)
 * This is used by client components that need cached data
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  revalidateIn: number; // seconds
}

class ServerSideCache {
  private prefix = 'sms_cache_';
  private memoryCache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached data (from in-memory store for client components)
   */
  get<T>(key: string): T | null {
    try {
      const entry = this.memoryCache.get(`${this.prefix}${key}`);
      if (!entry) return null;

      const now = Date.now();
      const ageSeconds = (now - entry.timestamp) / 1000;

      // Check if cache has expired
      if (ageSeconds > entry.revalidateIn) {
        this.remove(key);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Store data in memory cache (for client-side)
   * @param key Cache key
   * @param data Data to cache
   * @param revalidateIn Revalidation time in seconds (default: 300s/5min)
   */
  set<T>(key: string, data: T, revalidateIn: number = 300): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        revalidateIn,
      };
      this.memoryCache.set(`${this.prefix}${key}`, entry);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Remove cached data
   */
  remove(key: string): void {
    try {
      this.memoryCache.delete(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Cache removal error:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    try {
      this.memoryCache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Check if a cache entry exists and is valid
   */
  exists(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate multiple cache keys at once
   */
  invalidate(keys: string[] | readonly string[]): void {
    (keys as string[]).forEach((key) => this.remove(key));
  }

  /**
   * Clear cache by pattern (e.g., clear all student_* keys)
   */
  clearByPattern(pattern: string): void {
    try {
      const regex = new RegExp(`${this.prefix}${pattern}`);
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error('Cache pattern clear error:', error);
    }
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats(): { totalEntries: number; sizes: Record<string, number> } {
    try {
      const sizes: Record<string, number> = {};
      let totalSize = 0;

      for (const [key, entry] of this.memoryCache.entries()) {
        const size = JSON.stringify(entry.data).length;
        sizes[key.replace(this.prefix, '')] = size;
        totalSize += size;
      }

      return {
        totalEntries: this.memoryCache.size,
        sizes,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalEntries: 0, sizes: {} };
    }
  }
}

export const cache = new ServerSideCache();

/**
 * Cache keys used throughout the app
 */
export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD_STATS: 'dashboard_stats',
  FAILING_STUDENTS: 'failing_students',
  CALL_QUEUE_STUDENTS: 'call_queue_students',

  // Students
  ALL_STUDENTS: 'all_students',
  STUDENT_DETAIL: (id: string) => `student_${id}`,

  // Assignments & Tracking
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_DETAIL: (id: string) => `assignment_${id}`,

  // Call Logs & Follow-ups
  CALL_LOGS: 'call_logs',
  FOLLOW_UPS: 'follow_ups',

  // Settings
  SETTINGS: 'settings',
  CURRENT_ASSIGNMENT: 'current_assignment',

  // Reports
  CALL_STATISTICS: 'call_statistics',
  SUBMISSION_DATA: 'submission_data',
} as const;

/**
 * Cache expiration times (in seconds)
 * Server-side fetch caching uses force-cache (indefinite until revalidation)
 * These durations are for client-side in-memory cache fallback
 */
export const CACHE_EXPIRY = {
  SHORT: 2 * 60, // 2 minutes
  MEDIUM: 5 * 60, // 5 minutes (default)
  LONG: 15 * 60, // 15 minutes
  VERY_LONG: 30 * 60, // 30 minutes
} as const;

/**
 * Cache invalidation strategy - keys that should be cleared on mutations
 */
export const CACHE_INVALIDATION_TRIGGERS = {
  // When student is created/updated/deleted
  updateStudent: [
    CACHE_KEYS.ALL_STUDENTS,
    CACHE_KEYS.FAILING_STUDENTS,
    CACHE_KEYS.CALL_QUEUE_STUDENTS,
    CACHE_KEYS.DASHBOARD_STATS,
    CACHE_KEYS.SUBMISSION_DATA,
  ],

  // When assignment is updated
  updateAssignment: [
    CACHE_KEYS.ASSIGNMENTS,
    CACHE_KEYS.DASHBOARD_STATS,
    CACHE_KEYS.SUBMISSION_DATA,
  ],

  // When call log is added
  addCallLog: [CACHE_KEYS.CALL_LOGS, CACHE_KEYS.CALL_STATISTICS],

  // When follow-up is added
  addFollowUp: [CACHE_KEYS.FOLLOW_UPS, CACHE_KEYS.CALL_QUEUE_STUDENTS],
} as const;

/**
 * Helper functions for cache invalidation
 */

/**
 * Invalidate cache after student mutation
 */
export function invalidateStudentCache(studentId?: string): void {
  if (studentId) {
    // Invalidate specific student and affected lists
    cache.remove(CACHE_KEYS.STUDENT_DETAIL(studentId));
  }
  // Invalidate all student-related caches
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.updateStudent);
}

/**
 * Invalidate cache after assignment mutation
 */
export function invalidateAssignmentCache(assignmentId?: string): void {
  if (assignmentId) {
    cache.remove(CACHE_KEYS.ASSIGNMENT_DETAIL(assignmentId));
  }
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.updateAssignment);
}

/**
 * Invalidate cache after call log added
 */
export function invalidateCallLogCache(): void {
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.addCallLog);
}

/**
 * Invalidate cache after follow-up added
 */
export function invalidateFollowUpCache(): void {
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.addFollowUp);
}

/**
 * Clear all app caches (use sparingly, e.g., on logout)
 */
export function clearAllCaches(): void {
  cache.clear();
}

/**
 * Server-side cache revalidation functions using Next.js revalidateTag
 * Use these in Server Actions to invalidate fetch caches
 */

/**
 * Revalidate student-related caches on the server
 */
export async function revalidateStudentCaches(): Promise<void> {
  revalidateTag('students');
  revalidateTag('dashboard-stats');
  revalidateTag('failing-students');
  revalidateTag('submission-data');
}

/**
 * Revalidate assignment-related caches on the server
 */
export async function revalidateAssignmentCaches(): Promise<void> {
  revalidateTag('assignments');
  revalidateTag('dashboard-stats');
  revalidateTag('submission-data');
}

/**
 * Revalidate call log-related caches on the server
 */
export async function revalidateCallLogCaches(): Promise<void> {
  revalidateTag('call-logs');
  revalidateTag('call-statistics');
}

/**
 * Revalidate follow-up-related caches on the server
 */
export async function revalidateFollowUpCaches(): Promise<void> {
  revalidateTag('follow-ups');
  revalidateTag('call-queue-students');
}

/**
 * Revalidate all server-side caches
 */
export async function revalidateAllCaches(): Promise<void> {
  revalidateTag('students');
  revalidateTag('assignments');
  revalidateTag('call-logs');
  revalidateTag('follow-ups');
  revalidateTag('dashboard-stats');
  revalidateTag('failing-students');
  revalidateTag('call-queue-students');
  revalidateTag('call-statistics');
  revalidateTag('submission-data');
}
