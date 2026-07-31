import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  StatCardSkeleton,
  LinkCardSkeleton,
  NewsletterListSkeleton,
} from '../../src/components/LinkSkeleton';

describe('LinkSkeleton placeholders', () => {
  it('renders StatCardSkeleton with a pulsing container', () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('renders LinkCardSkeleton with a pulsing container', () => {
    const { container } = render(<LinkCardSkeleton />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('renders NewsletterListSkeleton with three placeholder rows', () => {
    const { container } = render(<NewsletterListSkeleton />);
    expect(container.querySelectorAll('.animate-pulse > div').length).toBe(3);
  });
});
