import axios from 'axios';
import { mockBackend } from './mockBackend';
import { LinkStatus, MediumLink, StatsData, PaginationMeta, User } from '../types';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_URL = rawApiUrl.trim();

export const apiClient = axios.create({
  baseURL: API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('insightstream_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, clear token and redirect to #/login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('insightstream_token');
      localStorage.removeItem('insightstream_user');
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(username: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    if (!API_URL) {
      // Mock login implementation
      await new Promise(r => setTimeout(r, 400));
      if (!username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
      }
      const token = `demo_jwt_token_${Date.now()}`;
      const user = { id: 'usr-1', username: username.trim() };
      return { success: true, token, user };
    }

    const response = await apiClient.post('/api/auth/login', { username, password });
    return response.data;
  }
};

export const statsApi = {
  async getStats(): Promise<{ success: boolean; data: StatsData }> {
    if (!API_URL) {
      const data = await mockBackend.getStats();
      return { success: true, data };
    }

    try {
      const response = await apiClient.get('/api/stats');
      return response.data;
    } catch (err) {
      // Fallback to mock data if remote server fails or isn't accessible
      console.warn('API call failed, using local offline dataset:', err);
      const data = await mockBackend.getStats();
      return { success: true, data };
    }
  }
};

export const linksApi = {
  async getLinks(params: {
    status?: string;
    page?: number;
    perPage?: number;
    sort?: string;
    search?: string;
  }): Promise<{ success: boolean; data: MediumLink[]; pagination: PaginationMeta }> {
    if (!API_URL) {
      const res = await mockBackend.getLinks(params);
      return { success: true, data: res.data, pagination: res.pagination };
    }

    try {
      const response = await apiClient.get('/api/links', { params });
      return response.data;
    } catch (err) {
      console.warn('API call failed, using local offline dataset:', err);
      const res = await mockBackend.getLinks(params);
      return { success: true, data: res.data, pagination: res.pagination };
    }
  },

  async getPrioritized(): Promise<{ success: boolean; data: MediumLink[] }> {
    if (!API_URL) {
      const data = await mockBackend.getPrioritizedLinks();
      return { success: true, data };
    }

    try {
      const response = await apiClient.get('/api/links/prioritized');
      return response.data;
    } catch (err) {
      console.warn('API call failed, using local offline dataset:', err);
      const data = await mockBackend.getPrioritizedLinks();
      return { success: true, data };
    }
  },

  async updateStatus(id: string, status: LinkStatus): Promise<{ success: boolean; message: string }> {
    if (!API_URL) {
      return await mockBackend.updateLinkStatus(id, status);
    }

    try {
      const response = await apiClient.put(`/api/links/${id}/status`, { status });
      return response.data;
    } catch (err) {
      console.warn('API update status failed, saving locally:', err);
      return await mockBackend.updateLinkStatus(id, status);
    }
  }
};
