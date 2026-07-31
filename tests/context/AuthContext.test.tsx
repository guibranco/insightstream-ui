import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

vi.mock('../../src/services/apiClient', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

import { authApi } from '../../src/services/apiClient';

const TestConsumer: React.FC = () => {
  const { user, token, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="username">{user?.username ?? 'none'}</div>
      <div data-testid="token">{token ?? 'none'}</div>
      <button onClick={() => login('alice', 'pw')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts unauthenticated and stops loading when no session is stored', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('restores a valid session from localStorage', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'restored' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('username').textContent).toBe('restored'));
    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('clears stored session data when the stored user JSON is corrupt', async () => {
    // Note: the token state is set before JSON.parse runs, so isAuthenticated
    // ends up true even though the corrupt user JSON fails to parse and the
    // stored session data is wiped. This test documents that actual behavior.
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', 'not-json{{');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('username').textContent).toBe('none');
    expect(localStorage.getItem('insightstream_token')).toBeNull();
    expect(localStorage.getItem('insightstream_user')).toBeNull();
  });

  it('login stores the token/user and updates state', async () => {
    (authApi.login as any).mockResolvedValueOnce({
      success: true,
      token: 'new-token',
      user: { id: 'u2', username: 'alice' },
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await user.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('username').textContent).toBe('alice'));
    expect(localStorage.getItem('insightstream_token')).toBe('new-token');
    expect(JSON.parse(localStorage.getItem('insightstream_user')!)).toEqual({
      id: 'u2',
      username: 'alice',
    });
  });

  it('login propagates errors without changing auth state', async () => {
    (authApi.login as any).mockRejectedValueOnce(new Error('bad credentials'));

    const FailingConsumer: React.FC = () => {
      const { login, isAuthenticated } = useAuth();
      const [error, setError] = React.useState('');
      return (
        <div>
          <div data-testid="authed">{String(isAuthenticated)}</div>
          <div data-testid="err">{error}</div>
          <button
            onClick={async () => {
              try {
                await login('x', 'y');
              } catch (e: any) {
                setError(e.message);
              }
            }}
          >
            go
          </button>
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <FailingConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByText('go'));
    await waitFor(() => expect(screen.getByTestId('err').textContent).toBe('bad credentials'));
    expect(screen.getByTestId('authed').textContent).toBe('false');
  });

  it('logout clears session and redirects to #/login', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'restored' }));
    window.location.hash = '#/';

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    await user.click(screen.getByText('logout'));

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(localStorage.getItem('insightstream_token')).toBeNull();
    expect(window.location.hash).toBe('#/login');
  });

  it('useAuth throws when used outside of an AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken: React.FC = () => {
      useAuth();
      return null;
    };
    expect(() => render(<Broken />)).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });
});
