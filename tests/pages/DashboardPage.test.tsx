import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { ToastProvider } from '../../src/context/ToastContext';
import { MediumLink, StatsData } from '../../src/types';

vi.mock('../../src/services/apiClient', () => ({
  statsApi: { getStats: vi.fn() },
  linksApi: { getPrioritized: vi.fn(), updateStatus: vi.fn() },
}));

import { statsApi, linksApi } from '../../src/services/apiClient';

const baseStats: StatsData = {
  statusCounts: { awaiting: 5, liked: 2, discarded: 1, discardedAfterReview: 0 },
  recentNewsletters: [{ id: 'nl-1', title: 'Weekly Digest', receivedDate: new Date().toISOString() }],
};

function makeLink(overrides: Partial<MediumLink> = {}): MediumLink {
  return {
    id: 'link-1',
    url: 'https://medium.com/a',
    title: 'Top Article',
    authorName: 'Author One',
    firstSeen: new Date().toISOString(),
    priorityScore: 9,
    status: 'awaiting',
    newsletterCount: 2,
    ...overrides,
  };
}

function renderDashboard() {
  return render(
    <ToastProvider>
      <DashboardPage />
    </ToastProvider>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons before data resolves', async () => {
    let resolveStats: (v: any) => void = () => {};
    (statsApi.getStats as any).mockReturnValue(new Promise((r) => (resolveStats = r)));
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [] });

    const { container } = renderDashboard();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    await act(async () => {
      resolveStats({ data: baseStats });
    });
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
        /Good (morning|afternoon|evening), Reader/
      )
    );
  });

  it('renders stats and prioritized links once loaded', async () => {
    (statsApi.getStats as any).mockResolvedValue({ data: baseStats });
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [makeLink()] });

    renderDashboard();

    await waitFor(() => expect(screen.getByText('Top Article')).toBeInTheDocument());
    expect(screen.getByText('Weekly Digest')).toBeInTheDocument();

    const overview = screen.getByLabelText('Overview metrics');
    expect(within(overview).getByText('5')).toBeInTheDocument();
  });

  it('shows an empty state when there are no prioritized links', async () => {
    (statsApi.getStats as any).mockResolvedValue({ data: baseStats });
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [] });

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByText('No pending priority links')).toBeInTheDocument()
    );
  });

  it('shows an error state and retries on demand', async () => {
    (statsApi.getStats as any)
      .mockRejectedValueOnce(new Error('backend unavailable'))
      .mockResolvedValueOnce({ data: baseStats });
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [] });

    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => expect(screen.getByText('backend unavailable')).toBeInTheDocument());

    await user.click(screen.getByText('Try Again'));
    await waitFor(() =>
      expect(screen.getByText('No pending priority links')).toBeInTheDocument()
    );
  });

  it('optimistically updates a link status and calls the API', async () => {
    (statsApi.getStats as any).mockResolvedValue({ data: baseStats });
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [makeLink()] });
    (linksApi.updateStatus as any).mockResolvedValue({ success: true, message: 'ok' });

    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => expect(screen.getByText('Top Article')).toBeInTheDocument());

    await user.click(screen.getByLabelText('Like article'));

    await waitFor(() => expect(screen.queryByText('Top Article')).toBeNull());
    expect(linksApi.updateStatus).toHaveBeenCalledWith('link-1', 'liked');
  });

  it('rolls back the optimistic update if the API call fails', async () => {
    (statsApi.getStats as any).mockResolvedValue({ data: baseStats });
    (linksApi.getPrioritized as any).mockResolvedValue({ data: [makeLink()] });
    (linksApi.updateStatus as any).mockRejectedValue(new Error('failed'));

    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => expect(screen.getByText('Top Article')).toBeInTheDocument());
    await user.click(screen.getByLabelText('Like article'));

    await waitFor(() => expect(screen.getByText('Top Article')).toBeInTheDocument());
  });
});
