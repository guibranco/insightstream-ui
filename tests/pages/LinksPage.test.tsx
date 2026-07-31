import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinksPage } from '../../src/pages/LinksPage';
import { ToastProvider } from '../../src/context/ToastContext';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { MediumLink } from '../../src/types';

vi.mock('../../src/services/apiClient', () => ({
  linksApi: { getLinks: vi.fn(), updateStatus: vi.fn() },
}));

import { linksApi } from '../../src/services/apiClient';

function makeLink(overrides: Partial<MediumLink> = {}): MediumLink {
  return {
    id: 'link-1',
    url: 'https://medium.com/a',
    title: 'Sample Article',
    authorName: 'Author One',
    firstSeen: new Date().toISOString(),
    priorityScore: 8,
    status: 'awaiting',
    newsletterCount: 1,
    ...overrides,
  };
}

function renderLinksPage(props: Partial<React.ComponentProps<typeof LinksPage>> = {}) {
  return render(
    <PreferencesProvider>
      <ToastProvider>
        <LinksPage {...props} />
      </ToastProvider>
    </PreferencesProvider>
  );
}

describe('LinksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (linksApi.getLinks as any).mockResolvedValue({
      data: [makeLink()],
      pagination: { total: 1, page: 1, perPage: 10, lastPage: 1 },
    });
    (linksApi.updateStatus as any).mockResolvedValue({ success: true, message: 'ok' });
  });

  it('defaults to the awaiting status and loads links', async () => {
    renderLinksPage();

    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());
    expect(linksApi.getLinks).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'awaiting' })
    );
  });

  it('resolves the "reviewed" legacy alias to discarded_after_review', async () => {
    renderLinksPage({ statusParam: 'reviewed' });

    await waitFor(() =>
      expect(linksApi.getLinks).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'discarded_after_review' })
      )
    );
  });

  it('falls back to awaiting for an unrecognized status param', async () => {
    renderLinksPage({ statusParam: 'bogus' });

    await waitFor(() =>
      expect(linksApi.getLinks).toHaveBeenCalledWith(expect.objectContaining({ status: 'awaiting' }))
    );
  });

  it('shows an empty state when there are no links', async () => {
    (linksApi.getLinks as any).mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, perPage: 10, lastPage: 1 },
    });

    renderLinksPage();

    await waitFor(() => expect(screen.getByText('Inbox zero! All clear.')).toBeInTheDocument());
  });

  it('shows an error state and retries on demand', async () => {
    (linksApi.getLinks as any)
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        data: [makeLink()],
        pagination: { total: 1, page: 1, perPage: 10, lastPage: 1 },
      });

    const user = userEvent.setup();
    renderLinksPage();

    await waitFor(() => expect(screen.getByText('network down')).toBeInTheDocument());

    await user.click(screen.getByText('Try Again'));
    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());
  });

  it('changes the status tab via the URL hash', async () => {
    const user = userEvent.setup();
    renderLinksPage();
    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());

    await user.click(screen.getByText('Liked'));
    expect(window.location.hash).toBe('#/links/liked');
  });

  it('debounces search input before refetching', async () => {
    // @testing-library/user-event hangs indefinitely when combined with
    // vitest's fake timers, so the debounced setTimeout is triggered via
    // fireEvent instead once fake timers are enabled.
    renderLinksPage();

    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());
    expect(linksApi.getLinks).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    const searchInput = screen.getByPlaceholderText('Search titles, authors, or domain URLs...');
    fireEvent.change(searchInput, { target: { value: 'agentic' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(linksApi.getLinks).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'agentic' })
    );
  });

  it('refetches with a new sort option when changed', async () => {
    const user = userEvent.setup();
    renderLinksPage();
    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());

    await user.selectOptions(screen.getByDisplayValue('Priority Score (High-Low)'), 'newest');

    await waitFor(() =>
      expect(linksApi.getLinks).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'newest' }))
    );
  });

  it('toggles between grid and list view modes', async () => {
    const user = userEvent.setup();
    renderLinksPage();
    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());

    await user.click(screen.getByLabelText('List View'));
    expect(screen.getByText('Like').tagName).toBe('SPAN');
  });

  it('updates a link status optimistically and calls the API', async () => {
    const user = userEvent.setup();
    renderLinksPage();
    await waitFor(() => expect(screen.getByText('Sample Article')).toBeInTheDocument());

    await user.click(screen.getByLabelText('Like article'));

    await waitFor(() => expect(screen.queryByText('Sample Article')).toBeNull());
    expect(linksApi.updateStatus).toHaveBeenCalledWith('link-1', 'liked');
  });

  it('shows pagination controls and navigates to the next page', async () => {
    (linksApi.getLinks as any).mockResolvedValue({
      data: [makeLink()],
      pagination: { total: 25, page: 1, perPage: 10, lastPage: 3 },
    });

    const user = userEvent.setup();
    renderLinksPage();

    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument());

    const paginationControls = screen.getByText('Page 1 of 3').parentElement!;
    const [prevButton, nextButton] = paginationControls.querySelectorAll('button');
    expect(prevButton).toBeDisabled();

    (linksApi.getLinks as any).mockResolvedValue({
      data: [makeLink({ id: 'link-2', title: 'Second Page Article' })],
      pagination: { total: 25, page: 2, perPage: 10, lastPage: 3 },
    });

    await user.click(nextButton);

    await waitFor(() =>
      expect(linksApi.getLinks).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    );
  });
});
