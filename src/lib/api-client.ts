/* eslint-disable @typescript-eslint/no-explicit-any */
import { CACHE_TAGS } from './cache-config';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://student-management-system-blue-beta.vercel.app';

interface FetchOptions extends RequestInit {
  cacheTags?: string[];
  cacheStrategy?: 'force-cache' | 'no-cache' | 'no-store';
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options?: FetchOptions
  ): Promise<{ data?: T; error?: string; statusCode: number; rawResponse?: any }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const { cacheTags, cacheStrategy, ...fetchOptions } = options || {};

      // For server-side requests, use Next.js cache with force-cache
      const cacheControl = cacheStrategy || 'force-cache';
      const nextConfig: any = {
        revalidate: 3600, // Revalidate every hour (can be overridden by cacheTags)
      };

      if (cacheTags) {
        nextConfig.tags = cacheTags;
      }

      const response = await fetch(url, {
        ...fetchOptions,
        next: nextConfig,
        // Use force-cache by default for GET requests
        cache: fetchOptions.method === 'GET' ? cacheControl : 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
      });

      const responseData = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        return {
          error: (responseData.message as string) || 'An error occurred',
          statusCode: response.status,
        };
      }

      return {
        data: (responseData.data || responseData) as T,
        statusCode: response.status,
        rawResponse: responseData,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
        statusCode: 500,
      };
    }
  }

  async get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

/**
 * Student endpoints with force-cache support
 * Server-side caching uses Next.js fetch with cache tags
 */
export const studentApi = {
  getAll: () =>
    apiClient.get('/api/students', {
      method: 'GET',
      cacheTags: [CACHE_TAGS.ALL_STUDENTS, CACHE_TAGS.STUDENT_LIST],
    }),
  getAllPaginated: (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = ''
  ) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    // Only cache first page without filters
    const shouldCache = page === 1 && !search && !status;
    return apiClient.get(`/api/students?${params.toString()}`, {
      cacheTags: shouldCache ? [CACHE_TAGS.STUDENT_LIST] : undefined,
    });
  },
  getById: (id: string) =>
    apiClient.get(`/api/students/${id}`, {
      cacheTags: [`student-${id}`],
    }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/api/students', data, {
      cacheStrategy: 'no-store', // Don't cache POST requests
    }),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/students/${id}`, data, {
      cacheStrategy: 'no-store', // Don't cache PUT requests
    }),
  delete: (id: string) =>
    apiClient.delete(`/api/students/${id}`, {
      cacheStrategy: 'no-store', // Don't cache DELETE requests
    }),
};

/**
 * Assignment endpoints with force-cache support
 */
export const assignmentApi = {
  getAll: () =>
    apiClient.get('/api/assignments', {
      cacheTags: [CACHE_TAGS.ASSIGNMENTS],
    }),
  getByStudentId: (studentId: string) =>
    apiClient.get(`/api/students/${studentId}/assignments`, {
      cacheTags: [CACHE_TAGS.ASSIGNMENTS],
    }),
  create: (studentId: string, data: Record<string, unknown>) =>
    apiClient.post(`/api/students/${studentId}/assignments`, data, {
      cacheStrategy: 'no-store',
    }),
  update: (studentId: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/students/${studentId}/assignments`, data, {
      cacheStrategy: 'no-store',
    }),
  delete: (studentId: string, assignmentNumber: number) =>
    apiClient.delete(
      `/api/students/${studentId}/assignments?assignmentNumber=${assignmentNumber}`,
      {
        cacheStrategy: 'no-store',
      }
    ),
};

/**
 * CallLog endpoints with force-cache support
 */
export const callLogApi = {
  getAll: () =>
    apiClient.get('/api/call-logs', {
      cacheTags: [CACHE_TAGS.CALL_LOGS, CACHE_TAGS.CALL_STATISTICS],
    }),
  getById: (id: string) =>
    apiClient.get(`/api/call-logs/${id}`, {
      cacheTags: [CACHE_TAGS.CALL_LOGS],
    }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/api/call-logs', data, {
      cacheStrategy: 'no-store',
    }),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/call-logs/${id}`, data, {
      cacheStrategy: 'no-store',
    }),
  delete: (id: string) =>
    apiClient.delete(`/api/call-logs/${id}`, {
      cacheStrategy: 'no-store',
    }),
};

/**
 * FollowUp endpoints with force-cache support
 */
export const followUpApi = {
  getAll: () =>
    apiClient.get('/api/follow-ups', {
      cacheTags: [CACHE_TAGS.FOLLOW_UPS],
    }),
  getById: (id: string) =>
    apiClient.get(`/api/follow-ups/${id}`, {
      cacheTags: [CACHE_TAGS.FOLLOW_UPS],
    }),
  create: (data: Record<string, unknown>) =>
    apiClient.post('/api/follow-ups', data, {
      cacheStrategy: 'no-store',
    }),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/follow-ups/${id}`, data, {
      cacheStrategy: 'no-store',
    }),
  delete: (id: string) =>
    apiClient.delete(`/api/follow-ups/${id}`, {
      cacheStrategy: 'no-store',
    }),
};

/**
 * Dashboard endpoints with force-cache support
 */
export const dashboardApi = {
  getStats: () =>
    apiClient.get('/api/dashboard/stats', {
      cacheTags: [CACHE_TAGS.DASHBOARD_STATS],
    }),
  getFailingStudents: (page: number = 1, limit: number = 10) =>
    apiClient.get(`/api/dashboard/failing-students?page=${page}&limit=${limit}`, {
      cacheTags: [CACHE_TAGS.FAILING_STUDENTS],
    }),
  getAssignmentStats: () =>
    apiClient.get('/api/dashboard/assignment-stats', {
      cacheTags: [CACHE_TAGS.SUBMISSION_DATA, CACHE_TAGS.DASHBOARD_STATS],
    }),
};
