import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '../../src/components/Navbar';
import { AuthProvider } from '../../src/context/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';

vi.mock('../../src/services/apiClient', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/apiClient')>(
    '../../src/services/apiClient'
  );
  return {
    ...actual,
    authApi: { login: vi.fn() },
  };
});

function renderNavbar() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList);
  });

  it('renders the brand logo and shows local storage mode when no API URL is set', () => {
    renderNavbar();
    expect(screen.getByText('Stream')).toBeInTheDocument();
    expect(screen.getByText('Local Storage API')).toBeInTheDocument();
  });

  it('does not render a user menu when logged out', async () => {
    renderNavbar();
    await waitFor(() => expect(screen.queryByRole('button', { name: /Sign Out/ })).toBeNull());
  });

  it('renders the user menu once a session is present and opens on click', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));

    const user = userEvent.setup();
    renderNavbar();

    await waitFor(() => expect(screen.getByText('curator')).toBeInTheDocument());

    await user.click(screen.getByText('curator'));
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('logs out when Sign Out is clicked', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));
    window.location.hash = '#/';

    const user = userEvent.setup();
    renderNavbar();
    await waitFor(() => expect(screen.getByText('curator')).toBeInTheDocument());

    await user.click(screen.getByText('curator'));
    await user.click(screen.getByText('Sign Out'));

    expect(window.location.hash).toBe('#/login');
    expect(localStorage.getItem('insightstream_token')).toBeNull();
  });

  it('cycles the theme when the theme toggle button is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const themeButton = screen.getByLabelText(/Current theme: auto/);
    await user.click(themeButton);
    expect(localStorage.getItem('insightstream_theme')).toBe('light');
  });

  it('opens the API config modal from the gear icon', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByLabelText('Configure API URL'));
    expect(screen.getByText('API Settings')).toBeInTheDocument();
  });
});
