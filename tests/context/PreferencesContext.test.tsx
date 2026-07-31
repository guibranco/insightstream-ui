import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesProvider, usePreferences } from '../../src/context/PreferencesContext';

const TestConsumer: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();
  return (
    <div>
      <div data-testid="theme">{preferences.theme}</div>
      <div data-testid="view">{preferences.defaultViewMode}</div>
      <div data-testid="perPage">{preferences.itemsPerPage}</div>
      <button onClick={() => updatePreferences({ defaultViewMode: 'list' })}>set-list</button>
      <button onClick={() => updatePreferences({ itemsPerPage: 50 })}>set-50</button>
    </div>
  );
};

describe('PreferencesContext', () => {
  it('provides default preferences when nothing is stored', () => {
    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('auto');
    expect(screen.getByTestId('view').textContent).toBe('grid');
    expect(screen.getByTestId('perPage').textContent).toBe('10');
  });

  it('loads and merges preferences saved in localStorage', () => {
    localStorage.setItem('insightstream_user_prefs', JSON.stringify({ itemsPerPage: 20 }));

    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );

    expect(screen.getByTestId('perPage').textContent).toBe('20');
    expect(screen.getByTestId('view').textContent).toBe('grid');
  });

  it('falls back to defaults when stored preferences are corrupt', () => {
    localStorage.setItem('insightstream_user_prefs', 'not-json{{');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('auto');
    spy.mockRestore();
  });

  it('updatePreferences merges partial updates and persists them', async () => {
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );

    await user.click(screen.getByText('set-list'));
    expect(screen.getByTestId('view').textContent).toBe('list');

    await user.click(screen.getByText('set-50'));
    expect(screen.getByTestId('perPage').textContent).toBe('50');

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('insightstream_user_prefs')!);
      expect(stored).toEqual({ theme: 'auto', defaultViewMode: 'list', itemsPerPage: 50 });
    });
  });

  it('usePreferences throws when used outside of a PreferencesProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken: React.FC = () => {
      usePreferences();
      return null;
    };
    expect(() => render(<Broken />)).toThrow(
      'usePreferences must be used within a PreferencesProvider'
    );
    spy.mockRestore();
  });
});
