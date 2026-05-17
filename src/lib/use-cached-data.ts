/**
 * Custom hook for fetching data with built-in caching
 * Simplifies cache management across the app
 */

import { useState, useEffect, useCallback } from 'react';
import { cache, CACHE_EXPIRY } from '@/lib/cache';

interface UseCachedDataOptions {
  cacheKey: string;
  cacheExpiry?: number;
  skip?: boolean; // Skip fetching if true
}

interface UseCachedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

/**
 * Hook for fetching data with automatic caching
 * @param fetcher - Async function that fetches data
 * @param options - Cache options (key, expiry time, skip flag)
 * @returns Object with data, loading, error, refetch, and invalidateCache
 */
export function useCachedData<T>(
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions
): UseCachedDataResult<T> {
  const { cacheKey, cacheExpiry = CACHE_EXPIRY.MEDIUM, skip = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);

  const invalidateCache = useCallback(() => {
    cache.remove(cacheKey);
    setData(null);
  }, [cacheKey]);

  const refetch = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);

      // Try cache first
      const cachedData = cache.get<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from source
      const result = await fetcher();
      setData(result);

      // Cache the result
      cache.set(cacheKey, result, cacheExpiry);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, cacheExpiry, fetcher, skip]);

  useEffect(() => {
    let isMounted = true;

    const performFetch = async () => {
      if (skip) return;

      try {
        if (isMounted) setLoading(true);
        if (isMounted) setError(null);

        // Try cache first
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
          if (isMounted) {
            setData(cachedData);
            setLoading(false);
          }
          return;
        }

        // Fetch from source
        const result = await fetcher();
        if (isMounted) {
          setData(result);
          cache.set(cacheKey, result, cacheExpiry);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to fetch data';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    performFetch();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, skip, fetcher, cacheExpiry]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache,
  };
}

/**
 * Pagination metadata from API responses
 */
interface PaginationMeta {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  [key: string]: unknown;
}

/**
 * Hook for fetching paginated data with caching
 * Only caches the first page (no filters)
 */
interface UsePaginatedCachedDataOptions extends UseCachedDataOptions {
  page?: number;
  hasFilters?: boolean;
}

interface UsePaginatedCachedDataResult<T> extends UseCachedDataResult<T[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export function usePaginatedCachedData<T>(
  fetcher: () => Promise<{ data: T[]; pagination?: PaginationMeta }>,
  options: UsePaginatedCachedDataOptions
): UsePaginatedCachedDataResult<T> {
  const { page = 1, hasFilters = false } = options;
  const { data, loading, error, refetch, invalidateCache } = useCachedData(
    async () => {
      const result = await fetcher();
      return result.data;
    },
    {
      ...options,
      // Only cache first page without filters
      skip: options.skip || page !== 1 || hasFilters,
    }
  );

  return {
    data: data || [],
    loading,
    error,
    refetch,
    invalidateCache,
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalItems: data?.length || 0,
    },
  };
}
