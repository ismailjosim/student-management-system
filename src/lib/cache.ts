/**
 * Simple caching utility for dashboard data with time-based expiration
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class LocalStorageCache {
  private prefix = 'sms_cache_';

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      // Check if cache has expired
      if (now - entry.timestamp > entry.expiresIn) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Store data in cache with expiration time
   * @param key Cache key
   * @param data Data to cache
   * @param expiresIn Expiration time in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Remove cached data
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Cache removal error:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
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
      const keys = Object.keys(localStorage);
      const regex = new RegExp(`${this.prefix}${pattern}`);
      keys.forEach((key) => {
        if (regex.test(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache pattern clear error:', error);
    }
  }

  /**
   * Get cache stats (for debugging)
   */
  getStats(): { totalEntries: number; sizes: Record<string, number> } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter((key) => key.startsWith(this.prefix));
      const sizes: Record<string, number> = {};

      cacheKeys.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          sizes[key.replace(this.prefix, '')] = item.length;
        }
      });

      return {
        totalEntries: cacheKeys.length,
        sizes,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalEntries: 0, sizes: {} };
    }
  }
}

export const cache = new LocalStorageCache();

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
 * Cache expiration times
 */
export const CACHE_EXPIRY = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 30 * 60 * 1000, // 30 minutes
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
