/**
 * Cache configuration constants
 * Client-safe module - no server-only API imports
 * Used by both client-side API client and server-side cache manager
 */

/**
 * Cache configuration for different data types
 * Defines cache tags and revalidation strategies
 */
export const CACHE_CONFIG = {
  // Dashboard
  DASHBOARD_STATS: {
    tag: 'dashboard-stats',
    revalidateSeconds: 300, // 5 minutes
  },
  FAILING_STUDENTS: {
    tag: 'failing-students',
    revalidateSeconds: 300,
  },
  CALL_QUEUE_STUDENTS: {
    tag: 'call-queue-students',
    revalidateSeconds: 180, // 3 minutes (more frequent updates)
  },

  // Students
  ALL_STUDENTS: {
    tag: 'all-students',
    revalidateSeconds: 600, // 10 minutes
  },
  STUDENT_DETAIL: (id: string) => ({
    tag: `student-${id}`,
    revalidateSeconds: 600,
  }),
  STUDENT_LIST: {
    tag: 'student-list',
    revalidateSeconds: 600,
  },

  // Assignments & Tracking
  ASSIGNMENTS: {
    tag: 'assignments',
    revalidateSeconds: 600,
  },
  ASSIGNMENT_DETAIL: (id: string) => ({
    tag: `assignment-${id}`,
    revalidateSeconds: 600,
  }),

  // Call Logs & Follow-ups
  CALL_LOGS: {
    tag: 'call-logs',
    revalidateSeconds: 180,
  },
  FOLLOW_UPS: {
    tag: 'follow-ups',
    revalidateSeconds: 180,
  },

  // Settings
  SETTINGS: {
    tag: 'settings',
    revalidateSeconds: 3600, // 1 hour (rarely changes)
  },
  CURRENT_ASSIGNMENT: {
    tag: 'current-assignment',
    revalidateSeconds: 600,
  },

  // Reports
  CALL_STATISTICS: {
    tag: 'call-statistics',
    revalidateSeconds: 300,
  },
  SUBMISSION_DATA: {
    tag: 'submission-data',
    revalidateSeconds: 300,
  },
} as const;

/**
 * Cache revalidation triggers
 * Maps mutations to cache tags that should be invalidated
 */
export const CACHE_REVALIDATION_TRIGGERS = {
  // When student is created/updated/deleted
  updateStudent: [
    CACHE_CONFIG.ALL_STUDENTS.tag,
    CACHE_CONFIG.STUDENT_LIST.tag,
    CACHE_CONFIG.FAILING_STUDENTS.tag,
    CACHE_CONFIG.CALL_QUEUE_STUDENTS.tag,
    CACHE_CONFIG.DASHBOARD_STATS.tag,
    CACHE_CONFIG.SUBMISSION_DATA.tag,
  ],

  // When assignment is updated
  updateAssignment: [
    CACHE_CONFIG.ASSIGNMENTS.tag,
    CACHE_CONFIG.DASHBOARD_STATS.tag,
    CACHE_CONFIG.SUBMISSION_DATA.tag,
  ],

  // When call log is added
  addCallLog: [
    CACHE_CONFIG.CALL_LOGS.tag,
    CACHE_CONFIG.CALL_STATISTICS.tag,
    CACHE_CONFIG.DASHBOARD_STATS.tag,
  ],

  // When follow-up is added
  addFollowUp: [CACHE_CONFIG.FOLLOW_UPS.tag, CACHE_CONFIG.CALL_QUEUE_STUDENTS.tag],

  // When settings change
  updateSettings: [CACHE_CONFIG.SETTINGS.tag, CACHE_CONFIG.DASHBOARD_STATS.tag],
} as const;

/**
 * Export cache tags for use in fetch requests
 * Usage: fetch(url, { next: { tags: [CACHE_TAGS.STUDENTS] } })
 */
export const CACHE_TAGS = {
  DASHBOARD_STATS: CACHE_CONFIG.DASHBOARD_STATS.tag,
  FAILING_STUDENTS: CACHE_CONFIG.FAILING_STUDENTS.tag,
  CALL_QUEUE_STUDENTS: CACHE_CONFIG.CALL_QUEUE_STUDENTS.tag,
  ALL_STUDENTS: CACHE_CONFIG.ALL_STUDENTS.tag,
  STUDENT_LIST: CACHE_CONFIG.STUDENT_LIST.tag,
  ASSIGNMENTS: CACHE_CONFIG.ASSIGNMENTS.tag,
  CALL_LOGS: CACHE_CONFIG.CALL_LOGS.tag,
  FOLLOW_UPS: CACHE_CONFIG.FOLLOW_UPS.tag,
  SETTINGS: CACHE_CONFIG.SETTINGS.tag,
  CURRENT_ASSIGNMENT: CACHE_CONFIG.CURRENT_ASSIGNMENT.tag,
  CALL_STATISTICS: CACHE_CONFIG.CALL_STATISTICS.tag,
  SUBMISSION_DATA: CACHE_CONFIG.SUBMISSION_DATA.tag,
} as const;
