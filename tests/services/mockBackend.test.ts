import { describe, it, expect } from 'vitest';
import { mockBackend } from '../../src/services/mockBackend';

describe('mockBackend', () => {
  describe('getStats', () => {
    it('returns status counts matching the seeded dataset and recent newsletters', async () => {
      const stats = await mockBackend.getStats();

      expect(stats.statusCounts).toEqual({
        awaiting: 10,
        liked: 2,
        discarded: 1,
        discardedAfterReview: 1,
      });
      expect(stats.recentNewsletters).toHaveLength(5);
    });

    it('reflects status changes made via updateLinkStatus', async () => {
      await mockBackend.updateLinkStatus('link-101', 'liked');
      const stats = await mockBackend.getStats();

      expect(stats.statusCounts.awaiting).toBe(9);
      expect(stats.statusCounts.liked).toBe(3);
    });
  });

  describe('getPrioritizedLinks', () => {
    it('returns the top 5 awaiting links sorted by priority score descending', async () => {
      const links = await mockBackend.getPrioritizedLinks();

      expect(links).toHaveLength(5);
      expect(links.map((l) => l.id)).toEqual([
        'link-101',
        'link-103',
        'link-102',
        'link-104',
        'link-105',
      ]);
      for (let i = 1; i < links.length; i++) {
        expect(links[i - 1].priorityScore).toBeGreaterThanOrEqual(links[i].priorityScore);
      }
    });

    it('excludes non-awaiting links', async () => {
      const links = await mockBackend.getPrioritizedLinks();
      expect(links.every((l) => l.status === 'awaiting')).toBe(true);
    });
  });

  describe('getLinks', () => {
    it('defaults to awaiting status, page 1, perPage 10, sorted by priority', async () => {
      const res = await mockBackend.getLinks({});

      expect(res.data).toHaveLength(10);
      expect(res.data.every((l) => l.status === 'awaiting')).toBe(true);
      expect(res.pagination).toEqual({ total: 10, page: 1, perPage: 10, lastPage: 1 });
      expect(res.data[0].id).toBe('link-101');
      expect(res.data[1].id).toBe('link-103');
    });

    it('maps the legacy "reviewed" status to discarded_after_review', async () => {
      const res = await mockBackend.getLinks({ status: 'reviewed' });
      expect(res.data).toHaveLength(1);
      expect(res.data[0].id).toBe('link-114');
    });

    it('returns all links when status is "all", respecting pagination', async () => {
      const page1 = await mockBackend.getLinks({ status: 'all', page: 1, perPage: 10 });
      expect(page1.data).toHaveLength(10);
      expect(page1.pagination).toEqual({ total: 14, page: 1, perPage: 10, lastPage: 2 });

      const page2 = await mockBackend.getLinks({ status: 'all', page: 2, perPage: 10 });
      expect(page2.data).toHaveLength(4);
    });

    it('filters by search query across title, author, and url', async () => {
      const res = await mockBackend.getLinks({ status: 'all', search: 'Elena Rostova' });
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((l) => l.authorName.toLowerCase().includes('elena rostova'))).toBe(true);
    });

    it('returns no results for a search query that matches nothing', async () => {
      const res = await mockBackend.getLinks({ status: 'all', search: 'zzz-no-match-zzz' });
      expect(res.data).toHaveLength(0);
      expect(res.pagination.total).toBe(0);
    });

    it('sorts by newest first', async () => {
      const res = await mockBackend.getLinks({ status: 'all', sort: 'newest', perPage: 20 });
      for (let i = 1; i < res.data.length; i++) {
        const prev = new Date(res.data[i - 1].firstSeen).getTime();
        const curr = new Date(res.data[i].firstSeen).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });

    it('sorts by oldest first', async () => {
      const res = await mockBackend.getLinks({ status: 'all', sort: 'oldest', perPage: 20 });
      for (let i = 1; i < res.data.length; i++) {
        const prev = new Date(res.data[i - 1].firstSeen).getTime();
        const curr = new Date(res.data[i].firstSeen).getTime();
        expect(prev).toBeLessThanOrEqual(curr);
      }
    });

    it('sorts alphabetically by title', async () => {
      const res = await mockBackend.getLinks({ status: 'all', sort: 'title', perPage: 20 });
      const titles = res.data.map((l) => l.title);
      const sorted = [...titles].sort((a, b) => a.localeCompare(b));
      expect(titles).toEqual(sorted);
    });

    it('paginates using the provided page and perPage values', async () => {
      const res = await mockBackend.getLinks({ status: 'awaiting', page: 2, perPage: 4 });
      expect(res.data).toHaveLength(4);
      expect(res.pagination).toEqual({ total: 10, page: 2, perPage: 4, lastPage: 3 });
    });
  });

  describe('updateLinkStatus', () => {
    it('updates the status of an existing link and persists it', async () => {
      const result = await mockBackend.updateLinkStatus('link-105', 'discarded');
      expect(result).toEqual({ success: true, message: 'Status updated to discarded' });

      const { data } = await mockBackend.getLinks({ status: 'discarded' });
      expect(data.some((l) => l.id === 'link-105')).toBe(true);
    });

    it('throws when the link id does not exist', async () => {
      await expect(mockBackend.updateLinkStatus('does-not-exist', 'liked')).rejects.toThrow(
        'Link not found'
      );
    });
  });
});
