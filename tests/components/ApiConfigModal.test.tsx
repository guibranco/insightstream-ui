import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
    vi.useFakeTimers();
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const eventSpy = vi.fn();
    window.addEventListener('insightstream_api_url_changed', eventSpy);

    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime });
    render(<ApiConfigModal isOpen onClose={onClose} onSaved={onSaved} />);

    const input = screen.getByPlaceholderText('https://api.yourdomain.com');
    await user.clear(input);
    await user.type(input, 'https://api.example.com');
    await user.click(screen.getByText('Save API URL'));

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
    vi.useFakeTimers();
    localStorage.setItem('insightstream_custom_api_url', 'https://api.example.com');
    const onSaved = vi.fn();
    const onClose = vi.fn();

    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime });
    render(<ApiConfigModal isOpen onClose={onClose} onSaved={onSaved} />);

    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    expect(getStoredApiUrl()).toBe('');
    expect(onSaved).toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(onClose).toHaveBeenCalled();
  });
});
