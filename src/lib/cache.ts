/**
 * Next.js v16 Cache Management
 * Uses Next.js built-in Data Cache with on-demand revalidation
 * No time-based expiry - revalidation only on data mutations
 *
 * See server-cache.ts for revalidation functions
 */

/**
 * Cache tags used throughout the app for on-demand revalidation
 */
export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD_STATS: 'dashboard-stats',
  FAILING_STUDENTS: 'failing-students',
  CALL_QUEUE_STUDENTS: 'call-queue-students',

  // Students
  ALL_STUDENTS: 'all-students',
  STUDENT_DETAIL: (id: string) => `student-${id}`,
  STUDENT_LIST: 'student-list',

  // Assignments & Tracking
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_DETAIL: (id: string) => `assignment-${id}`,

  // Call Logs & Follow-ups
  CALL_LOGS: 'call-logs',
  FOLLOW_UPS: 'follow-ups',

  // Settings
  SETTINGS: 'settings',
  CURRENT_ASSIGNMENT: 'current-assignment',

  // Reports
  CALL_STATISTICS: 'call-statistics',
  SUBMISSION_DATA: 'submission-data',
} as const;

/**
 * Cache invalidation trigger groups
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
 * Cache expiry constants for client-side memory cache.
 */
export const CACHE_EXPIRY = {
  SHORT: 2 * 60, // 2 minutes
  MEDIUM: 5 * 60, // 5 minutes
  LONG: 15 * 60, // 15 minutes
  VERY_LONG: 30 * 60, // 30 minutes
} as const;

type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export const cache = {
  get: <T>(key: string): T | null => {
    const entry = memoryCache.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  },

  set: <T>(key: string, value: T, expirySeconds?: number): void => {
    const expiresAt = expirySeconds ? Date.now() + expirySeconds * 1000 : null;

    memoryCache.set(key, {
      value,
      expiresAt,
    });
  },

  remove: (key: string): void => {
    memoryCache.delete(key);
  },

  clear: (): void => {
    memoryCache.clear();
  },
};

/**
 * Server-side cache invalidation functions
 *
 * DEPRECATED:
 * Use revalidateCacheTags() from server-cache.ts directly.
 */

export async function invalidateStudentCache(
  _studentId?: string
): Promise<void> {
  // No-op
}

export async function invalidateCallLogCache(): Promise<void> {
  // No-op
}

export async function invalidateFollowUpCache(): Promise<void> {
  // No-op
}
