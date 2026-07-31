import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from '../../src/components/ToastContainer';
import { ToastProvider, useToast } from '../../src/context/ToastContext';

const Harness: React.FC = () => {
  const { showToast } = useToast();
  return (
    <>
      <button onClick={() => showToast('Saved successfully', 'success')}>show-success</button>
      <button onClick={() => showToast('Something failed', 'error')}>show-error</button>
      <button
        onClick={() =>
          showToast('Undo me', 'success', 'Undo', vi.fn(), 0)
        }
      >
        show-with-action
      </button>
      <ToastContainer />
    </>
  );
};

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a success toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );

    await user.click(screen.getByText('show-success'));
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('renders an error toast', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );

    await user.click(screen.getByText('show-error'));
    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });

  it('dismisses a toast when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>
    );

    await user.click(screen.getByText('show-with-action'));
    expect(screen.getByText('Undo me')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close notification'));
    expect(screen.queryByText('Undo me')).toBeNull();
  });

  it('invokes the toast action and dismisses it when the action button is clicked', async () => {
    const onAction = vi.fn();
    const HarnessWithSpy: React.FC = () => {
      const { showToast } = useToast();
      return (
        <>
          <button onClick={() => showToast('Deleted item', 'success', 'Undo', onAction, 0)}>
            show
          </button>
          <ToastContainer />
        </>
      );
    };

    const user = userEvent.setup();
    render(
      <ToastProvider>
        <HarnessWithSpy />
      </ToastProvider>
    );

    await user.click(screen.getByText('show'));
    await user.click(screen.getByText('Undo'));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Deleted item')).toBeNull();
  });
});
