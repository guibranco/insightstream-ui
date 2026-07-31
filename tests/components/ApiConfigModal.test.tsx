import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiConfigModal } from '../../src/components/ApiConfigModal';
import { getStoredApiUrl } from '../../src/services/apiClient';

describe('ApiConfigModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ApiConfigModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the form and local storage mode indicator when open with no custom URL', () => {
    render(<ApiConfigModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText('API Settings')).toBeInTheDocument();
    expect(screen.getByText('(None - Local Storage Mode)')).toBeInTheDocument();
    expect(screen.queryByText('Reset')).toBeNull();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<ApiConfigModal isOpen onClose={onClose} />);

    const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the Cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ApiConfigModal isOpen onClose={onClose} />);

    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('saves a custom API URL, dispatches an update event, and calls onSaved', async () => {
    // @testing-library/user-event's internal wait/flush loop does not play
    // well with vitest's fake timers (it hangs indefinitely even with an
    // `advanceTimers` option configured). Type with real timers first, then
    // switch to fake timers only for the button click and the auto-close
    // timeout, using fireEvent for that click to avoid the incompatibility.
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const eventSpy = vi.fn();
    window.addEventListener('insightstream_api_url_changed', eventSpy);

    const user = userEvent.setup();
    render(<ApiConfigModal isOpen onClose={onClose} onSaved={onSaved} />);

    const input = screen.getByPlaceholderText('https://api.yourdomain.com');
    await user.clear(input);
    await user.type(input, 'https://api.example.com');

    vi.useFakeTimers();
    fireEvent.click(screen.getByText('Save API URL'));

    expect(getStoredApiUrl()).toBe('https://api.example.com');
    expect(eventSpy).toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
    expect(screen.getByText('API URL updated successfully!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(onClose).toHaveBeenCalled();

    window.removeEventListener('insightstream_api_url_changed', eventSpy);
  });

  it('shows a Reset button and resets the custom URL when clicked', async () => {
    localStorage.setItem('insightstream_custom_api_url', 'https://api.example.com');
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(<ApiConfigModal isOpen onClose={onClose} onSaved={onSaved} />);

    vi.useFakeTimers();
    fireEvent.click(screen.getByText('Reset'));

    expect(getStoredApiUrl()).toBe('');
    expect(onSaved).toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(onClose).toHaveBeenCalled();
  });
});
