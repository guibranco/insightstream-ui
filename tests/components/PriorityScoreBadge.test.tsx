import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityScoreBadge } from '../../src/components/PriorityScoreBadge';

describe('PriorityScoreBadge', () => {
  it('renders the score formatted to one decimal', () => {
    render(<PriorityScoreBadge score={8.456} />);
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('labels scores below 4 as Low Priority', () => {
    render(<PriorityScoreBadge score={2} />);
    expect(screen.getByText('2.0').closest('span[title]')).toHaveAttribute(
      'title',
      expect.stringContaining('Low Priority')
    );
  });

  it('labels scores between 4 and 7 as Medium Priority', () => {
    render(<PriorityScoreBadge score={5.5} />);
    expect(screen.getByText('5.5').closest('span[title]')).toHaveAttribute(
      'title',
      expect.stringContaining('Medium Priority')
    );
  });

  it('labels scores of 7 and above as High Priority', () => {
    render(<PriorityScoreBadge score={9} />);
    expect(screen.getByText('9.0').closest('span[title]')).toHaveAttribute(
      'title',
      expect.stringContaining('High Priority')
    );
  });

  it('clamps the progress bar width for out-of-range scores', () => {
    const { container, rerender } = render(<PriorityScoreBadge score={20} showBar />);
    let bar = container.querySelector('div[style]') as HTMLElement;
    expect(bar.style.width).toBe('100%');

    rerender(<PriorityScoreBadge score={-5} showBar />);
    bar = container.querySelector('div[style]') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });

  it('hides the progress bar when showBar is false', () => {
    const { container } = render(<PriorityScoreBadge score={5} showBar={false} />);
    expect(container.querySelector('div[style]')).toBeNull();
  });
});
