import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

vi.mock('../../src/services/mockBackend', () => ({
  mockBackend: {
    getStats: vi.fn(),
    getPrioritizedLinks: vi.fn(),
    getLinks: vi.fn(),
    updateLinkStatus: vi.fn(),
  },
}));

import { mockBackend } from '../../src/services/mockBackend';
import {
  apiClient,
  authApi,
  statsApi,
  linksApi,
  getStoredApiUrl,
  getEffectiveApiUrl,
  setCustomApiUrl,
} from '../../src/services/apiClient';

describe('apiClient url helpers', () => {
  it('getStoredApiUrl returns empty string when nothing is stored', () => {
    expect(getStoredApiUrl()).toBe('');
  });

  it('setCustomApiUrl stores a trimmed url and getStoredApiUrl reflects it', () => {
    setCustomApiUrl('  https://api.example.com  ');
    expect(getStoredApiUrl()).toBe('https://api.example.com');
    expect(getEffectiveApiUrl()).toBe('https://api.example.com');
  });

  it('setCustomApiUrl with a blank value removes the stored override', () => {
    setCustomApiUrl('https://api.example.com');
    setCustomApiUrl('   ');
    expect(getStoredApiUrl()).toBe('');
  });

  it('getEffectiveApiUrl falls back to empty string when nothing is configured', () => {
    expect(getEffectiveApiUrl()).toBe('');
  });
});

describe('apiClient interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a request interceptor that attaches the bearer token and baseURL', () => {
    const [onFulfilled] = mockAxiosInstance.interceptors.request.use.mock.calls[0];
    localStorage.setItem('insightstream_token', 'tok-123');
    setCustomApiUrl('https://api.example.com');

    const config = onFulfilled({ headers: {} });

    expect(config.baseURL).toBe('https://api.example.com');
    expect(config.headers.Authorization).toBe('Bearer tok-123');
  });

  it('request interceptor leaves Authorization unset without a stored token', () => {
    const [onFulfilled] = mockAxiosInstance.interceptors.request.use.mock.calls[0];
    const config = onFulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('request interceptor error handler rejects with the original error', async () => {
    const [, onRejected] = mockAxiosInstance.interceptors.request.use.mock.calls[0];
    await expect(onRejected('boom')).rejects.toBe('boom');
  });

  it('response interceptor passes through successful responses', () => {
    const [onFulfilled] = mockAxiosInstance.interceptors.response.use.mock.calls[0];
    const response = { data: 'ok' };
    expect(onFulfilled(response)).toBe(response);
  });

  it('response interceptor clears session and redirects to login on 401', async () => {
    localStorage.setItem('insightstream_token', 'tok-123');
    localStorage.setItem('insightstream_user', '{"id":"1"}');
    window.location.hash = '#/';

    const [, onRejected] = mockAxiosInstance.interceptors.response.use.mock.calls[0];
    const error = { response: { status: 401 } };

    await expect(onRejected(error)).rejects.toBe(error);
    expect(localStorage.getItem('insightstream_token')).toBeNull();
    expect(localStorage.getItem('insightstream_user')).toBeNull();
    expect(window.location.hash).toBe('#/login');
  });

  it('response interceptor ignores non-401 errors', async () => {
    const [, onRejected] = mockAxiosInstance.interceptors.response.use.mock.calls[0];
    const error = { response: { status: 500 } };
    await expect(onRejected(error)).rejects.toBe(error);
  });
});

describe('authApi.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCustomApiUrl('');
  });

  it('returns a demo token/user in offline mode for valid credentials', async () => {
    const res = await authApi.login('alice', 'password');
    expect(res.success).toBe(true);
    expect(res.user).toEqual({ id: 'usr-1', username: 'alice' });
    expect(res.token).toMatch(/^demo_jwt_token_/);
  });

  it('throws when username or password is blank in offline mode', async () => {
    await expect(authApi.login('', 'password')).rejects.toThrow(
      'Username and password are required'
    );
    await expect(authApi.login('alice', '  ')).rejects.toThrow(
      'Username and password are required'
    );
  });

  it('delegates to the remote API when a custom URL is configured', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.post.mockResolvedValueOnce({
      data: { success: true, token: 'remote-token', user: { id: '2', username: 'bob' } },
    });

    const res = await authApi.login('bob', 'secret');
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'bob',
      password: 'secret',
    });
    expect(res.token).toBe('remote-token');
  });
});

describe('statsApi.getStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCustomApiUrl('');
  });

  it('uses the mock backend when no API url is configured', async () => {
    (mockBackend.getStats as any).mockResolvedValueOnce({ statusCounts: {}, recentNewsletters: [] });

    const res = await statsApi.getStats();
    expect(res.success).toBe(true);
    expect(mockBackend.getStats).toHaveBeenCalled();
  });

  it('uses the remote API when a URL is configured', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { success: true, data: { foo: 'bar' } } });

    const res = await statsApi.getStats();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/stats');
    expect(res.data).toEqual({ foo: 'bar' });
  });

  it('falls back to the mock backend when the remote API call fails', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('network error'));
    (mockBackend.getStats as any).mockResolvedValueOnce({ statusCounts: {}, recentNewsletters: [] });

    const res = await statsApi.getStats();
    expect(res.success).toBe(true);
    expect(mockBackend.getStats).toHaveBeenCalled();
  });
});

describe('linksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCustomApiUrl('');
  });

  it('getLinks uses the mock backend in offline mode', async () => {
    (mockBackend.getLinks as any).mockResolvedValueOnce({
      data: [],
      pagination: { total: 0, page: 1, perPage: 10, lastPage: 1 },
    });

    const res = await linksApi.getLinks({ status: 'awaiting' });
    expect(res.success).toBe(true);
    expect(mockBackend.getLinks).toHaveBeenCalledWith({ status: 'awaiting' });
  });

  it('getLinks uses the remote API and falls back on failure', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('down'));
    (mockBackend.getLinks as any).mockResolvedValueOnce({
      data: [],
      pagination: { total: 0, page: 1, perPage: 10, lastPage: 1 },
    });

    const res = await linksApi.getLinks({ status: 'awaiting' });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/links', { params: { status: 'awaiting' } });
    expect(mockBackend.getLinks).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('getPrioritized uses the mock backend in offline mode', async () => {
    (mockBackend.getPrioritizedLinks as any).mockResolvedValueOnce([]);
    const res = await linksApi.getPrioritized();
    expect(res.success).toBe(true);
    expect(mockBackend.getPrioritizedLinks).toHaveBeenCalled();
  });

  it('getPrioritized uses the remote API when configured', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.get.mockResolvedValueOnce({ data: { success: true, data: [{ id: 'x' }] } });
    const res = await linksApi.getPrioritized();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/links/prioritized');
    expect(res.data).toEqual([{ id: 'x' }]);
  });

  it('getPrioritized falls back to the mock backend on remote failure', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('down'));
    (mockBackend.getPrioritizedLinks as any).mockResolvedValueOnce([]);
    const res = await linksApi.getPrioritized();
    expect(res.success).toBe(true);
    expect(mockBackend.getPrioritizedLinks).toHaveBeenCalled();
  });

  it('updateStatus uses the mock backend in offline mode', async () => {
    (mockBackend.updateLinkStatus as any).mockResolvedValueOnce({ success: true, message: 'ok' });
    const res = await linksApi.updateStatus('link-1', 'liked');
    expect(mockBackend.updateLinkStatus).toHaveBeenCalledWith('link-1', 'liked');
    expect(res.success).toBe(true);
  });

  it('updateStatus uses the remote API when configured', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.put.mockResolvedValueOnce({ data: { success: true, message: 'updated' } });
    const res = await linksApi.updateStatus('link-1', 'liked');
    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/api/links/link-1/status', { status: 'liked' });
    expect(res.message).toBe('updated');
  });

  it('updateStatus falls back to the mock backend on remote failure', async () => {
    setCustomApiUrl('https://api.example.com');
    mockAxiosInstance.put.mockRejectedValueOnce(new Error('down'));
    (mockBackend.updateLinkStatus as any).mockResolvedValueOnce({ success: true, message: 'ok' });
    const res = await linksApi.updateStatus('link-1', 'liked');
    expect(res.success).toBe(true);
    expect(mockBackend.updateLinkStatus).toHaveBeenCalled();
  });
});

describe('apiClient instance', () => {
  it('is the mocked axios instance created via axios.create', () => {
    expect(apiClient).toBe(mockAxiosInstance);
  });
});
