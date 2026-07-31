import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { StatsData } from '../src/types';

vi.mock('../src/services/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/apiClient')>();
  return {
    ...actual,
    authApi: { login: vi.fn() },
    statsApi: { getStats: vi.fn() },
    linksApi: { getLinks: vi.fn(), getPrioritized: vi.fn(), updateStatus: vi.fn() },
  };
});

import { statsApi, linksApi } from '../src/services/apiClient';

const baseStats: StatsData = {
  statusCounts: { awaiting: 1, liked: 0, discarded: 0, discardedAfterReview: 0 },
  recentNewsletters: [],
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (statsApi.getStats as any).mockResolvedValue({ data: baseStats });
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [] });
    (linksApi.getLinks as any).mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, perPage: 10, lastPage: 1 },
    });
  });

  it('redirects unauthenticated users to the login page', async () => {
    window.location.hash = '#/';
    render(<App />);

    await waitFor(() => expect(screen.getByText('Welcome back')).toBeInTheDocument());
  });

  it('renders the dashboard for an authenticated user', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));
    window.location.hash = '#/';

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Reader/)
    );
    expect(screen.getByText('curator')).toBeInTheDocument();
  });

  it('renders the links page for the current status route', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));
    window.location.hash = '#/links/liked';

    render(<App />);

    await waitFor(() =>
      expect(linksApi.getLinks).toHaveBeenCalledWith(expect.objectContaining({ status: 'liked' }))
    );
  });

  it('renders the preferences page', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));
    window.location.hash = '#/preferences';

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText('Dashboard Preferences')).toBeInTheDocument()
    );
  });

  it('redirects unknown routes back to the dashboard when authenticated', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));
    window.location.hash = '#/this-route-does-not-exist';

    render(<App />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Reader/)
    );
  });
});
