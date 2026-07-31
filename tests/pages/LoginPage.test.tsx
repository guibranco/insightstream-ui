import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../../src/pages/LoginPage';

const login = vi.fn();

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ login }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset();
    window.location.hash = '#/login';
  });

  it('renders with prefilled demo credentials', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Enter username')).toHaveValue('demo_curator');
    expect(screen.getByPlaceholderText('••••••••')).toHaveValue('password123');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = passwordInput.closest('div')!.querySelector('button')!;
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('shows a validation error when fields are blank', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.clear(screen.getByPlaceholderText('Enter username'));
    await user.clear(screen.getByPlaceholderText('••••••••'));
    await user.click(screen.getByText('Sign In to Dashboard'));

    expect(
      screen.getByText('Please enter both username and password.')
    ).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('calls login and redirects on success', async () => {
    login.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByText('Sign In to Dashboard'));

    await waitFor(() => expect(login).toHaveBeenCalledWith('demo_curator', 'password123'));
    await waitFor(() => expect(window.location.hash).toBe('#/'));
  });

  it('shows the error message returned by a failed login', async () => {
    login.mockRejectedValueOnce(new Error('Invalid credentials'));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByText('Sign In to Dashboard'));

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
  });

  it('prefers a response-shaped error message when available', async () => {
    login.mockRejectedValueOnce({ response: { data: { message: 'Server rejected login' } } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByText('Sign In to Dashboard'));

    await waitFor(() =>
      expect(screen.getByText('Server rejected login')).toBeInTheDocument()
    );
  });

  it('falls back to a generic error message', async () => {
    login.mockRejectedValueOnce({});
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByText('Sign In to Dashboard'));

    await waitFor(() =>
      expect(screen.getByText('Login failed. Please check credentials.')).toBeInTheDocument()
    );
  });
});
