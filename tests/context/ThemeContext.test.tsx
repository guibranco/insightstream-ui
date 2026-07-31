import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';

function mockMatchMedia(matches: boolean) {
  const listeners: Array<() => void> = [];
  const mql = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_event: string, cb: () => void) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(mql as unknown as MediaQueryList);
  return { mql, listeners };
}

const TestConsumer: React.FC = () => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="effective">{effectiveTheme}</div>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('auto')}>auto</button>
    </div>
  );
};

describe('ThemeContext', () => {
  it('defaults to auto theme and resolves effective theme from matchMedia', async () => {
    mockMatchMedia(false);
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('auto');
    await waitFor(() => expect(screen.getByTestId('effective').textContent).toBe('light'));
  });

  it('resolves effective theme to dark when system prefers dark in auto mode', async () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByTestId('effective').textContent).toBe('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('restores the theme stored in localStorage', () => {
    mockMatchMedia(false);
    localStorage.setItem('insightstream_theme', 'dark');

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('setTheme updates state, localStorage, and the document class list', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByText('dark'));
    await waitFor(() => expect(screen.getByTestId('effective').textContent).toBe('dark'));
    expect(localStorage.getItem('insightstream_theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(screen.getByText('light'));
    await waitFor(() => expect(screen.getByTestId('effective').textContent).toBe('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('registers a media query change listener only in auto mode', async () => {
    const { mql } = mockMatchMedia(false);
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    await user.click(screen.getByRole('button', { name: 'light' }));
    expect(mql.removeEventListener).toHaveBeenCalled();
  });

  it('useTheme throws when used outside of a ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken: React.FC = () => {
      useTheme();
      return null;
    };
    expect(() => render(<Broken />)).toThrow('useTheme must be used within a ThemeProvider');
    spy.mockRestore();
  });
});
