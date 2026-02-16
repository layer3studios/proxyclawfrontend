import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  ApiResponse, User, Deployment, DeploymentStatusResponse,
  LoginRequest, RegisterRequest, CreateDeploymentRequest,
  DeploymentActionRequest, CapacityInfo,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use((c) => {
  const token = localStorage.getItem('token');
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
}, (e) => Promise.reject(e));

apiClient.interceptors.response.use((r) => r, (error: AxiosError<ApiResponse>) => {
  const apiError = error.response?.data?.error;
  if (apiError) {
    if (apiError.code === 'TOKEN_EXPIRED' || apiError.code === 'INVALID_TOKEN') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(apiError.message);
  }
  throw new Error(error.message || 'Network error');
});

export const authApi = {
  login: async (data: LoginRequest): Promise<{ user: User; token: string }> => {
    const r = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    return r.data.data!;
  },
  register: async (data: RegisterRequest): Promise<{ user: User; token: string }> => {
    const r = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return r.data.data!;
  },
  google: async (credential: string): Promise<{ user: User; token: string }> => {
    const r = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/google', { credential });
    return r.data.data!;
  },
  me: async (): Promise<User> => {
    const r = await apiClient.get<ApiResponse<User>>('/auth/me');
    return r.data.data!;
  },
  refresh: async (): Promise<{ token: string }> => {
    const r = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return r.data.data!;
  },
};

export const deploymentsApi = {
  list: async (page = 1, limit = 10): Promise<{ deployments: Deployment[]; meta: ApiResponse['meta'] }> => {
    const r = await apiClient.get<ApiResponse<Deployment[]>>(`/deployments?page=${page}&limit=${limit}`);
    return { deployments: r.data.data || [], meta: r.data.meta };
  },
  get: async (id: string): Promise<Deployment> => {
    const r = await apiClient.get<ApiResponse<Deployment>>(`/deployments/${id}`); return r.data.data!;
  },
  create: async (data: CreateDeploymentRequest): Promise<Deployment> => {
    const r = await apiClient.post<ApiResponse<Deployment>>('/deployments', data); return r.data.data!;
  },
  getStatus: async (id: string): Promise<DeploymentStatusResponse> => {
    const r = await apiClient.get<ApiResponse<DeploymentStatusResponse>>(`/deployments/${id}/status`); return r.data.data!;
  },
  action: async (id: string, action: DeploymentActionRequest['action']): Promise<void> => {
    await apiClient.post<ApiResponse>(`/deployments/${id}/action`, { action });
  },
  getLogs: async (id: string, tail = 100): Promise<{ logs: string }> => {
    const r = await apiClient.get<ApiResponse<{ logs: string }>>(`/deployments/${id}/logs?tail=${tail}`); return r.data.data!;
  },
  getStats: async (id: string): Promise<{ status: string; cpu?: number; memory?: number }> => {
    const r = await apiClient.get<ApiResponse<{ status: string; cpu?: number; memory?: number }>>(`/deployments/${id}/stats`); return r.data.data!;
  },
};

// Billing — one-time $10 order
export const billingApi = {
  createOrder: async (currency?: string): Promise<any> => {
    const r = await apiClient.post<ApiResponse>('/billing/create-order', { currency });
    return r.data.data;
  },
  verify: async (data: { razorpayOrderId: string; razorpayPaymentId: string; signature: string }) => {
    const r = await apiClient.post<ApiResponse>('/billing/verify', data);
    return r.data;
  },
  getSubscription: async () => {
    const r = await apiClient.get<ApiResponse>('/billing/subscription');
    return r.data.data;
  },
};

export const capacityApi = {
  getCapacity: async (): Promise<CapacityInfo> => {
    const r = await apiClient.get<ApiResponse<CapacityInfo>>('/public/capacity'); return r.data.data!;
  },
};

export const healthApi = {
  check: async (): Promise<{ status: string; version: string }> => {
    const r = await apiClient.get<ApiResponse<{ status: string; version: string }>>('/health'); return r.data.data!;
  },
};

export default apiClient;
