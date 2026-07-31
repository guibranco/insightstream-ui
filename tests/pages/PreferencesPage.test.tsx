import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesPage } from '../../src/pages/PreferencesPage';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { AuthProvider } from '../../src/context/AuthContext';
import { ToastProvider } from '../../src/context/ToastContext';
import { ToastContainer } from '../../src/components/ToastContainer';

function renderPage() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <PreferencesProvider>
          <ToastProvider>
            <PreferencesPage />
            <ToastContainer />
          </ToastProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('PreferencesPage', () => {
  it('renders the appearance, display, and API sections', () => {
    renderPage();
    expect(screen.getByText('Theme & Appearance')).toBeInTheDocument();
    expect(screen.getByText('Display & Pagination')).toBeInTheDocument();
    expect(screen.getByText('REST API Configuration')).toBeInTheDocument();
  });

  it('changes the theme when a theme option is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Dark Theme'));
    expect(localStorage.getItem('insightstream_theme')).toBe('dark');
  });

  it('updates the default view mode preference', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('List Compact'));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('insightstream_user_prefs')!);
      expect(stored.defaultViewMode).toBe('list');
    });
  });

  it('updates items-per-page preference', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('20 Items'));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('insightstream_user_prefs')!);
      expect(stored.itemsPerPage).toBe(20);
    });
  });

  it('saves a custom API URL and shows a success toast', async () => {
    const user = userEvent.setup();
    renderPage();

    const input = screen.getByPlaceholderText('https://api.yourdomain.com');
    await user.type(input, 'https://api.example.com');
    await user.click(screen.getByText('Save URL'));

    expect(localStorage.getItem('insightstream_custom_api_url')).toBe('https://api.example.com');
    await waitFor(() =>
      expect(screen.getByText('API URL updated and saved to localStorage')).toBeInTheDocument()
    );
  });

  it('resets a custom API URL', async () => {
    localStorage.setItem('insightstream_custom_api_url', 'https://api.example.com');
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Reset'));

    expect(localStorage.getItem('insightstream_custom_api_url')).toBeNull();
    await waitFor(() => expect(screen.getByText('Reset custom API URL')).toBeInTheDocument());
  });

  it('tests the API connection and reports local storage mode when offline', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    renderPage();

    await user.click(screen.getByText('Test Connection'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });

    await waitFor(() =>
      expect(
        screen.getByText('Offline Mode Active: Persisting data to LocalStorage')
      ).toBeInTheDocument()
    );
  });

  it('shows account info and signs out when requested', async () => {
    localStorage.setItem('insightstream_token', 'tok-1');
    localStorage.setItem('insightstream_user', JSON.stringify({ id: 'u1', username: 'curator' }));
    window.location.hash = '#/preferences';

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => expect(screen.getByText('Logged in as curator')).toBeInTheDocument());

    await user.click(screen.getByText('Sign Out of InsightStream'));

    expect(window.location.hash).toBe('#/login');
    await waitFor(() => expect(screen.getByText('Signed out successfully')).toBeInTheDocument());
  });
});
