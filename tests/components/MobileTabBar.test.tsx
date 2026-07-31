import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileTabBar } from '../../src/components/MobileTabBar';

describe('MobileTabBar', () => {
  it('renders all five navigation tabs with correct hrefs', () => {
    window.location.hash = '#/';
    render(<MobileTabBar />);

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '#/');
    expect(screen.getByText('Awaiting').closest('a')).toHaveAttribute('href', '#/links/awaiting');
    expect(screen.getByText('Liked').closest('a')).toHaveAttribute('href', '#/links/liked');
    expect(screen.getByText('Discarded').closest('a')).toHaveAttribute('href', '#/links/discarded');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '#/preferences');
  });

  it('marks the Dashboard tab active when the hash is empty/root', () => {
    window.location.hash = '#/';
    render(<MobileTabBar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveClass('text-[#79378B]');
  });

  it('marks the Liked tab active based on the current hash prefix', () => {
    window.location.hash = '#/links/liked';
    render(<MobileTabBar />);
    expect(screen.getByText('Liked').closest('a')).toHaveClass('text-[#79378B]');
    expect(screen.getByText('Dashboard').closest('a')).not.toHaveClass('text-[#79378B]');
  });
});
