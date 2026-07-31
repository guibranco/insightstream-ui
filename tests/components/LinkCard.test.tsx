import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkCard } from '../../src/components/LinkCard';
import { MediumLink } from '../../src/types';

function makeLink(overrides: Partial<MediumLink> = {}): MediumLink {
  return {
    id: 'link-1',
    url: 'https://medium.com/article',
    title: 'A Great Article',
    authorName: 'Jane Doe',
    firstSeen: new Date().toISOString(),
    priorityScore: 8,
    status: 'awaiting',
    newsletterCount: 1,
    ...overrides,
  };
}

describe('LinkCard', () => {
  it('renders the title and author in grid mode', () => {
    render(<LinkCard link={makeLink()} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('A Great Article')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('1 edition')).toBeInTheDocument();
  });

  it('pluralizes the newsletter count label', () => {
    render(<LinkCard link={makeLink({ newsletterCount: 3 })} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('3 editions')).toBeInTheDocument();
  });

  it('falls back to a default author label when missing', () => {
    render(<LinkCard link={makeLink({ authorName: '' })} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Medium Author')).toBeInTheDocument();
  });

  it('shows Like/Reviewed/Discard actions for awaiting links and calls onUpdateStatus', async () => {
    const onUpdateStatus = vi.fn();
    const user = userEvent.setup();
    render(<LinkCard link={makeLink({ status: 'awaiting' })} onUpdateStatus={onUpdateStatus} />);

    await user.click(screen.getByLabelText('Like article'));
    expect(onUpdateStatus).toHaveBeenCalledWith('link-1', 'liked');

    await user.click(screen.getByLabelText('Discard after review'));
    expect(onUpdateStatus).toHaveBeenCalledWith('link-1', 'discarded_after_review');

    await user.click(screen.getByLabelText('Discard article'));
    expect(onUpdateStatus).toHaveBeenCalledWith('link-1', 'discarded');
  });

  it('shows a restore action for non-awaiting links', async () => {
    const onUpdateStatus = vi.fn();
    const user = userEvent.setup();
    render(<LinkCard link={makeLink({ status: 'liked' })} onUpdateStatus={onUpdateStatus} />);

    await user.click(screen.getByText('Restore to Awaiting'));
    expect(onUpdateStatus).toHaveBeenCalledWith('link-1', 'awaiting');
  });

  it('renders the list view layout', () => {
    render(<LinkCard link={makeLink()} viewMode="list" onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('A Great Article')).toBeInTheDocument();
    expect(screen.getByText('Like').tagName).toBe('SPAN');
  });

  it('applies a disabled visual state while updating', () => {
    const { container } = render(
      <LinkCard link={makeLink()} onUpdateStatus={vi.fn()} isUpdating />
    );
    expect(container.firstChild).toHaveClass('opacity-50');
  });

  it('formats recent timestamps as relative time', () => {
    render(
      <LinkCard
        link={makeLink({ firstSeen: new Date(Date.now() - 5000).toISOString() })}
        onUpdateStatus={vi.fn()}
      />
    );
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('formats minute-old timestamps', () => {
    render(
      <LinkCard
        link={makeLink({ firstSeen: new Date(Date.now() - 5 * 60_000).toISOString() })}
        onUpdateStatus={vi.fn()}
      />
    );
    expect(screen.getByText('5m ago')).toBeInTheDocument();
  });

  it('formats hour-old timestamps', () => {
    render(
      <LinkCard
        link={makeLink({ firstSeen: new Date(Date.now() - 3 * 3_600_000).toISOString() })}
        onUpdateStatus={vi.fn()}
      />
    );
    expect(screen.getByText('3h ago')).toBeInTheDocument();
  });

  it('formats day-old timestamps', () => {
    render(
      <LinkCard
        link={makeLink({ firstSeen: new Date(Date.now() - 2 * 86_400_000).toISOString() })}
        onUpdateStatus={vi.fn()}
      />
    );
    expect(screen.getByText('2d ago')).toBeInTheDocument();
  });

  it('falls back to a locale date string for very old timestamps', () => {
    const old = new Date(Date.now() - 10 * 86_400_000);
    render(<LinkCard link={makeLink({ firstSeen: old.toISOString() })} onUpdateStatus={vi.fn()} />);
    const expected = old.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('renders "Invalid Date" for unparseable timestamps rather than throwing', () => {
    render(<LinkCard link={makeLink({ firstSeen: 'not-a-date' })} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Invalid Date')).toBeInTheDocument();
  });
});
