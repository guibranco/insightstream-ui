import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '../../src/components/ErrorState';

describe('ErrorState', () => {
  it('renders the default message when none is provided', () => {
    render(<ErrorState />);
    expect(screen.getByText('Failed to load data from server.')).toBeInTheDocument();
  });

  it('renders a custom message', () => {
    render(<ErrorState message="Network unreachable" />);
    expect(screen.getByText('Network unreachable')).toBeInTheDocument();
  });

  it('does not render a retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Try Again')).toBeNull();
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState onRetry={onRetry} />);

    await user.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
