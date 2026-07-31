import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../../src/components/EmptyState';

describe('EmptyState', () => {
  it('shows the search-empty message when hasSearchQuery is true', () => {
    render(<EmptyState hasSearchQuery onClearSearch={vi.fn()} />);
    expect(screen.getByText('No matching articles found')).toBeInTheDocument();
  });

  it('calls onClearSearch when the clear button is clicked', async () => {
    const onClearSearch = vi.fn();
    const user = userEvent.setup();
    render(<EmptyState hasSearchQuery onClearSearch={onClearSearch} />);

    await user.click(screen.getByText('Clear Search'));
    expect(onClearSearch).toHaveBeenCalled();
  });

  it('omits the clear button when onClearSearch is not provided', () => {
    render(<EmptyState hasSearchQuery />);
    expect(screen.queryByText('Clear Search')).toBeNull();
  });

  it('shows the inbox-zero message for the awaiting status by default', () => {
    render(<EmptyState />);
    expect(screen.getByText('Inbox zero! All clear.')).toBeInTheDocument();
  });

  it('shows a liked-specific message', () => {
    render(<EmptyState status="liked" />);
    expect(screen.getByText('No liked articles yet')).toBeInTheDocument();
  });

  it('shows a reviewed-specific message for discarded_after_review', () => {
    render(<EmptyState status="discarded_after_review" />);
    expect(screen.getByText('No reviewed articles')).toBeInTheDocument();
  });

  it('shows a reviewed-specific message for the legacy "reviewed" alias', () => {
    render(<EmptyState status="reviewed" />);
    expect(screen.getByText('No reviewed articles')).toBeInTheDocument();
  });

  it('shows a discarded-specific message', () => {
    render(<EmptyState status="discarded" />);
    expect(screen.getByText('No discarded articles')).toBeInTheDocument();
  });

  it('falls back to the awaiting message for unknown statuses', () => {
    render(<EmptyState status="something-unexpected" />);
    expect(screen.getByText('Inbox zero! All clear.')).toBeInTheDocument();
  });
});
