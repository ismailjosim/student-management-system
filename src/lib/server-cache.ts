/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Server-side cache management for Next.js v16
 * Uses force-cache with revalidation tags
 * Replaces localStorage-based caching with Next.js built-in caching
 */
import 'server-only';
import { revalidateTag, revalidatePath as nextRevalidatePath } from 'next/cache';
import { CACHE_CONFIG, CACHE_REVALIDATION_TRIGGERS, CACHE_TAGS } from './cache-config';

/**
 * Revalidate a single cache tag
 * @param tag - Cache tag to revalidate
 */
export function revalidateCacheTag(tag: string): void {
  try {
    // @ts-expect-error - revalidateTag type definitions mismatch in this Next.js version
    revalidateTag(tag);
    console.log(`✓ Revalidated cache tag: ${tag}`);
  } catch (error) {
    console.error(`Failed to revalidate cache tag ${tag}:`, error);
  }
}

/**
 * Revalidate multiple cache tags
 * @param tags - Array of cache tags to revalidate
 */
export function revalidateCacheTags(tags: readonly string[]): void {
  tags.forEach((tag) => {
    revalidateCacheTag(tag);
  });
}

/**
 * Revalidate all cache tags for a specific trigger event
 * @param trigger - Trigger event type (e.g., 'updateStudent', 'updateAssignment')
 */
export function revalidateOnMutation(trigger: keyof typeof CACHE_REVALIDATION_TRIGGERS): void {
  const tagsToRevalidate = CACHE_REVALIDATION_TRIGGERS[trigger];
  revalidateCacheTags(tagsToRevalidate);
  console.log(`✓ Revalidated ${tagsToRevalidate.length} cache tags on ${trigger}`);
}

/**
 * Revalidate a path after mutations
 * @param path - Path to revalidate
 * @param type - 'page' or 'layout' (optional)
 */
export function revalidateCachePath(path: string, type: 'page' | 'layout' = 'page'): void {
  try {
    nextRevalidatePath(path, type);
    console.log(`✓ Revalidated path: ${path}`);
  } catch (error) {
    console.error(`Failed to revalidate path ${path}:`, error);
  }
}

/**
 * Get cache tag from config
 * Utility function to retrieve cache tag for a resource
 */
export function getCacheTag(resourceType: keyof typeof CACHE_CONFIG, id?: string): string {
  const config = CACHE_CONFIG[resourceType];

  if (typeof config === 'function' && id) {
    return config(id).tag;
  }

  if (typeof config === 'object' && 'tag' in config) {
    return config.tag;
  }

  return '';
}

/**
 * Get multiple cache tags for batch operations
 * Useful for invalidating multiple related resources
 */
export function getCacheTags(
  resources: Array<{ type: keyof typeof CACHE_CONFIG; id?: string }>
): string[] {
  return resources.map(({ type, id }) => getCacheTag(type, id)).filter(Boolean);
}

/**
 * Server-side cache manager
 * Centralizes all cache management operations
 */
export const serverCacheManager = {
  /**
   * Invalidate cache after student mutation
   */
  invalidateStudent(studentId?: string): void {
    if (studentId) {
      revalidateCacheTag(getCacheTag('STUDENT_DETAIL', studentId));
    }
    revalidateOnMutation('updateStudent');
  },

  /**
   * Invalidate cache after assignment mutation
   */
  invalidateAssignment(assignmentId?: string): void {
    if (assignmentId) {
      revalidateCacheTag(getCacheTag('ASSIGNMENT_DETAIL', assignmentId));
    }
    revalidateOnMutation('updateAssignment');
  },

  /**
   * Invalidate cache after call log added
   */
  invalidateCallLog(): void {
    revalidateOnMutation('addCallLog');
  },

  /**
   * Invalidate cache after follow-up added
   */
  invalidateFollowUp(): void {
    revalidateOnMutation('addFollowUp');
  },

  /**
   * Invalidate cache after settings change
   */
  invalidateSettings(): void {
    revalidateOnMutation('updateSettings');
  },

  /**
   * Clear all application caches
   */
  clearAll(): void {
    const allTags = Object.values(CACHE_CONFIG)
      .map((config: any) => (typeof config === 'function' ? null : config?.tag))
      .filter((tag): tag is string => tag !== null && typeof tag === 'string');

    revalidateCacheTags([...new Set(allTags)]);
    console.log('✓ Cleared all application caches');
  },
} as const;

/**
 * Export cache configuration from cache-config.ts
 * Available for use in fetch requests and server-side cache management
 */
export { CACHE_CONFIG, CACHE_REVALIDATION_TRIGGERS, CACHE_TAGS } from './cache-config';
