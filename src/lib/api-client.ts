/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://student-management-system-blue-beta.vercel.app';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<{ data?: T; error?: string; statusCode: number; rawResponse?: any }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
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

  async get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Student endpoints
export const studentApi = {
  getAll: () =>
    apiClient.get('/api/students', {
      method: 'GET',
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
    return apiClient.get(`/api/students?${params.toString()}`);
  },
  getById: (id: string) => apiClient.get(`/api/students/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/api/students', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/api/students/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/students/${id}`),
};

// Assignment endpoints
export const assignmentApi = {
  getAll: () => apiClient.get('/api/assignments'),
  getById: (id: string) => apiClient.get(`/api/assignments/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/api/assignments', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/assignments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/assignments/${id}`),
  submit: (id: string, completedDate?: Date) =>
    apiClient.put(`/api/assignments/${id}/submit`, { completedDate }),
  complete: (id: string, completedDate?: Date) =>
    apiClient.put(`/api/assignments/${id}/complete`, { completedDate }),
};

// CallLog endpoints
export const callLogApi = {
  getAll: () => apiClient.get('/api/call-logs'),
  getById: (id: string) => apiClient.get(`/api/call-logs/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/api/call-logs', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/call-logs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/call-logs/${id}`),
};

// FollowUp endpoints
export const followUpApi = {
  getAll: () => apiClient.get('/api/follow-ups'),
  getById: (id: string) => apiClient.get(`/api/follow-ups/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post('/api/follow-ups', data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/follow-ups/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/follow-ups/${id}`),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => apiClient.get('/api/dashboard/stats'),
  getFailingStudents: (page: number = 1, limit: number = 10) =>
    apiClient.get(`/api/dashboard/failing-students?page=${page}&limit=${limit}`),
  getAssignmentStats: () => apiClient.get('/api/dashboard/assignment-stats'),
};
