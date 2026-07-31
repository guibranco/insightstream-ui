import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../../src/context/ToastContext';

const TestConsumer: React.FC = () => {
  const { toasts, showToast, dismissToast } = useToast();
  return (
    <div>
      <div data-testid="count">{toasts.length}</div>
      <ul>
        {toasts.map((t) => (
          <li key={t.id} data-testid="toast">
            {t.type}:{t.message}
          </li>
        ))}
      </ul>
      <button onClick={() => showToast('hello')}>default</button>
      <button onClick={() => showToast('quick', 'error', undefined, undefined, 100)}>quick</button>
      <button onClick={() => showToast('sticky', 'info', undefined, undefined, 0)}>sticky</button>
      <button onClick={() => dismissToast(toasts[0]?.id)}>dismiss-first</button>
    </div>
  );
};

describe('ToastContext', () => {
  it('starts with no toasts', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('showToast adds a toast with success type by default', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    await user.click(screen.getByText('default'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('toast').textContent).toBe('success:hello');
  });

  it('auto-dismisses a toast after its duration elapses', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText('quick').click();
    });
    expect(screen.getByTestId('count').textContent).toBe('1');

    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('does not auto-dismiss when duration is 0', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    await act(async () => {
      screen.getByText('sticky').click();
    });

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('limits the number of active toasts to 4', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByText('sticky'));
    }

    expect(screen.getByTestId('count').textContent).toBe('4');
  });

  it('dismissToast removes a specific toast by id', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    await user.click(screen.getByText('sticky'));
    expect(screen.getByTestId('count').textContent).toBe('1');

    await user.click(screen.getByText('dismiss-first'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('useToast throws when used outside of a ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken: React.FC = () => {
      useToast();
      return null;
    };
    expect(() => render(<Broken />)).toThrow('useToast must be used within a ToastProvider');
    spy.mockRestore();
  });
});
