/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Next.js v16 Cache Management
 * Client-side in-memory cache only.
 * Server-side cache invalidation is handled directly in API routes/Server Actions
 * via serverCacheManager from server-cache.ts
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
   * Server-side caching is handled by Next.js force-cache
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

      for (const [key, entry] of this.memoryCache.entries()) {
        const size = JSON.stringify(entry.data).length;
        sizes[key.replace(this.prefix, '')] = size;
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
  STUDENT_LIST: 'student_list',

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
 * These durations are for client-side in-memory cache only.
 * Server-side uses Next.js force-cache (indefinite until revalidation).
 */
export const CACHE_EXPIRY = {
  SHORT: 2 * 60, // 2 minutes
  MEDIUM: 5 * 60, // 5 minutes (default)
  LONG: 15 * 60, // 15 minutes
  VERY_LONG: 30 * 60, // 30 minutes
} as const;

/**
 * Client-side cache invalidation triggers.
 * For server-side invalidation, call serverCacheManager directly
 * from your API routes or Server Actions.
 */
export const CACHE_INVALIDATION_TRIGGERS = {
  updateStudent: [
    CACHE_KEYS.ALL_STUDENTS,
    CACHE_KEYS.STUDENT_LIST,
    CACHE_KEYS.FAILING_STUDENTS,
    CACHE_KEYS.CALL_QUEUE_STUDENTS,
    CACHE_KEYS.DASHBOARD_STATS,
    CACHE_KEYS.SUBMISSION_DATA,
  ],
  updateAssignment: [
    CACHE_KEYS.ASSIGNMENTS,
    CACHE_KEYS.DASHBOARD_STATS,
    CACHE_KEYS.SUBMISSION_DATA,
  ],
  addCallLog: [CACHE_KEYS.CALL_LOGS, CACHE_KEYS.CALL_STATISTICS],
  addFollowUp: [CACHE_KEYS.FOLLOW_UPS, CACHE_KEYS.CALL_QUEUE_STUDENTS],
} as const;

/**
 * Client-side only cache invalidation helpers.
 * These only clear the in-memory cache.
 *
 * For server cache invalidation, call serverCacheManager from server-cache.ts
 * directly inside your API route or Server Action, e.g.:
 *
 *   import { serverCacheManager } from '@/lib/server-cache';
 *   serverCacheManager.invalidateStudent(studentId);
 */
export function invalidateStudentCache(studentId?: string): void {
  if (studentId) {
    cache.remove(CACHE_KEYS.STUDENT_DETAIL(studentId));
  }
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.updateStudent);
}

export function invalidateAssignmentCache(assignmentId?: string): void {
  if (assignmentId) {
    cache.remove(CACHE_KEYS.ASSIGNMENT_DETAIL(assignmentId));
  }
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.updateAssignment);
}

export function invalidateCallLogCache(): void {
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.addCallLog);
}

export function invalidateFollowUpCache(): void {
  cache.invalidate(CACHE_INVALIDATION_TRIGGERS.addFollowUp);
}

export function clearAllCaches(): void {
  cache.clear();
}
