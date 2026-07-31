import { MediumLink, Newsletter, StatsData, LinkStatus, PaginationMeta } from '../types';

const STORAGE_KEY_LINKS = 'insightstream_mock_links_v2';
const STORAGE_KEY_NEWSLETTERS = 'insightstream_mock_newsletters_v2';

const INITIAL_NEWSLETTERS: Newsletter[] = [
  { id: 'nl-1', title: 'Medium Daily Digest: AI, Engineering & Design', receivedDate: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'nl-2', title: 'Towards Data Science Daily: LLMs & Modern Architecture', receivedDate: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: 'nl-3', title: 'UX Collective: The Future of Spatial & Generative UI', receivedDate: new Date(Date.now() - 3600000 * 42).toISOString() },
  { id: 'nl-4', title: 'JavaScript in Plain English Weekly Spotlight', receivedDate: new Date(Date.now() - 3600000 * 70).toISOString() },
  { id: 'nl-5', title: 'The Startup Newsletter: Scalable Systems & Growth', receivedDate: new Date(Date.now() - 3600000 * 96).toISOString() }
];

const INITIAL_LINKS: MediumLink[] = [
  {
    id: 'link-101',
    url: 'https://medium.com/towards-data-science/building-agentic-rag-systems-with-hybrid-search-a8f9021',
    title: 'Building Production-Grade Agentic RAG Systems with Hybrid Vector Search',
    authorName: 'Dr. Elena Rostova',
    firstSeen: new Date(Date.now() - 3600000 * 3).toISOString(),
    priorityScore: 9.6,
    status: 'awaiting',
    newsletterCount: 4
  },
  {
    id: 'link-102',
    url: 'https://medium.com/ux-collective/micro-interactions-that-delight-and-convert-in-2026-c7b1209',
    title: 'Micro-Interactions That Delight: Designing Tactile Digital Experiences',
    authorName: 'Marcus Vance',
    firstSeen: new Date(Date.now() - 3600000 * 5).toISOString(),
    priorityScore: 8.9,
    status: 'awaiting',
    newsletterCount: 3
  },
  {
    id: 'link-103',
    url: 'https://medium.com/bits-and-bytes/why-distributed-databases-fail-under-partitioning-e810a99',
    title: 'How Distributed Consensus Protocols Handle Edge-Case Network Partitions',
    authorName: 'Sarah Jenkins',
    firstSeen: new Date(Date.now() - 3600000 * 8).toISOString(),
    priorityScore: 9.1,
    status: 'awaiting',
    newsletterCount: 5
  },
  {
    id: 'link-104',
    url: 'https://medium.com/javascript-in-plain-english/vite-6-and-the-future-of-instant-module-replacement-f52901',
    title: 'Vite 6 In Depth: Tree-Shaking Secrets & Sub-Millisecond Cold Starts',
    authorName: 'Alex Rivero',
    firstSeen: new Date(Date.now() - 3600000 * 12).toISOString(),
    priorityScore: 8.2,
    status: 'awaiting',
    newsletterCount: 2
  },
  {
    id: 'link-105',
    url: 'https://medium.com/swlh/scaling-websocket-clusters-to-10-million-concurrent-connections-a90192',
    title: 'Scaling WebSocket Edge Gateway Clusters to 10M Concurrent Connections',
    authorName: 'David Chen',
    firstSeen: new Date(Date.now() - 3600000 * 15).toISOString(),
    priorityScore: 7.8,
    status: 'awaiting',
    newsletterCount: 3
  },
  {
    id: 'link-106',
    url: 'https://medium.com/better-programming/optimizing-memory-allocations-in-go-garbage-collector-9b1102',
    title: 'Zero-Allocation Go: Advanced Pointer Tracking & Escape Analysis Patterns',
    authorName: 'Pavel Novak',
    firstSeen: new Date(Date.now() - 3600000 * 20).toISOString(),
    priorityScore: 6.4,
    status: 'awaiting',
    newsletterCount: 1
  },
  {
    id: 'link-107',
    url: 'https://medium.com/design-bootcamp/typography-scale-mathematics-for-responsive-ui-c8910',
    title: 'Fluid Typographic Scaling: Mathematical Ratios for Clean Modern Interfaces',
    authorName: 'Chloe Bennett',
    firstSeen: new Date(Date.now() - 3600000 * 24).toISOString(),
    priorityScore: 5.9,
    status: 'awaiting',
    newsletterCount: 2
  },
  {
    id: 'link-108',
    url: 'https://medium.com/tech-lead-journal/engineering-leadership-in-remote-first-organizations-33a01',
    title: 'Asynchronous Code Reviews & High-Trust Engineering Cultures',
    authorName: 'Jonathan Hayes',
    firstSeen: new Date(Date.now() - 3600000 * 30).toISOString(),
    priorityScore: 5.2,
    status: 'awaiting',
    newsletterCount: 1
  },
  {
    id: 'link-109',
    url: 'https://medium.com/daily-dev-news/10-css-tricks-you-didnt-know-existed-b81093',
    title: '10 Quick CSS Container Query Recipes for Flexible Layout Components',
    authorName: 'Liam O\'Connor',
    firstSeen: new Date(Date.now() - 3600000 * 36).toISOString(),
    priorityScore: 3.8,
    status: 'awaiting',
    newsletterCount: 1
  },
  {
    id: 'link-110',
    url: 'https://medium.com/general-tech/generic-productivity-hacks-for-developers-d9101',
    title: '5 Daily Habits to Double Your Daily Coding Throughput',
    authorName: 'Sam Taylor',
    firstSeen: new Date(Date.now() - 3600000 * 48).toISOString(),
    priorityScore: 2.5,
    status: 'awaiting',
    newsletterCount: 1
  },
  {
    id: 'link-111',
    url: 'https://medium.com/towards-data-science/fine-tuning-small-language-models-for-domain-code-completion-f29101',
    title: 'Fine-Tuning SLMs on Proprietary Codebases: Lessons from 100 Experiments',
    authorName: 'Dr. Elena Rostova',
    firstSeen: new Date(Date.now() - 3600000 * 50).toISOString(),
    priorityScore: 9.3,
    status: 'liked',
    newsletterCount: 4
  },
  {
    id: 'link-112',
    url: 'https://medium.com/ux-collective/accessible-color-contrast-and-wcag-2-2-standards-881203',
    title: 'Accessible Design Standards: WCAG 2.2 Compliance and Color Contrast Strategies',
    authorName: 'Marcus Vance',
    firstSeen: new Date(Date.now() - 3600000 * 60).toISOString(),
    priorityScore: 8.5,
    status: 'liked',
    newsletterCount: 2
  },
  {
    id: 'link-113',
    url: 'https://medium.com/clickbait-tech/top-10-programming-languages-you-must-learn-in-2026-x9101',
    title: 'Top 10 Languages You Must Master Before Tomorrow',
    authorName: 'Anonymous Blogger',
    firstSeen: new Date(Date.now() - 3600000 * 72).toISOString(),
    priorityScore: 1.8,
    status: 'discarded',
    newsletterCount: 1
  },
  {
    id: 'link-114',
    url: 'https://medium.com/tech-reviews/a-deep-dive-into-legacy-monolith-decoupling-strategies-p9103',
    title: 'Decoupling Monolithic Services: Strangler Fig Pattern in Real Enterprise Systems',
    authorName: 'Sarah Jenkins',
    firstSeen: new Date(Date.now() - 3600000 * 84).toISOString(),
    priorityScore: 7.2,
    status: 'discarded_after_review',
    newsletterCount: 3
  }
];

function loadLinks(): MediumLink[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LINKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(INITIAL_LINKS));
      return JSON.parse(JSON.stringify(INITIAL_LINKS));
    }
    return JSON.parse(raw);
  } catch (err) {
    return JSON.parse(JSON.stringify(INITIAL_LINKS));
  }
}

function saveLinks(links: MediumLink[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
  } catch (err) {
    console.error('Failed to save mock links to localStorage', err);
  }
}

function loadNewsletters(): Newsletter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NEWSLETTERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NEWSLETTERS, JSON.stringify(INITIAL_NEWSLETTERS));
      return JSON.parse(JSON.stringify(INITIAL_NEWSLETTERS));
    }
    return JSON.parse(raw);
  } catch (err) {
    return JSON.parse(JSON.stringify(INITIAL_NEWSLETTERS));
  }
}

export const mockBackend = {
  async getStats(): Promise<StatsData> {
    await new Promise(r => setTimeout(r, 180)); // realistic network latency
    const links = loadLinks();
    const newsletters = loadNewsletters();

    const counts = {
      awaiting: 0,
      liked: 0,
      discarded: 0,
      discardedAfterReview: 0
    };

    links.forEach(link => {
      if (link.status === 'awaiting') counts.awaiting++;
      else if (link.status === 'liked') counts.liked++;
      else if (link.status === 'discarded') counts.discarded++;
      else if (link.status === 'discarded_after_review') counts.discardedAfterReview++;
    });

    return {
      statusCounts: counts,
      recentNewsletters: newsletters
    };
  },

  async getPrioritizedLinks(): Promise<MediumLink[]> {
    await new Promise(r => setTimeout(r, 200));
    const links = loadLinks();
    // Top 5 highest priority links that are awaiting
    const awaiting = links.filter(l => l.status === 'awaiting');
    awaiting.sort((a, b) => b.priorityScore - a.priorityScore);
    return awaiting.slice(0, 5);
  },

  async getLinks(params: {
    status?: string;
    page?: number;
    perPage?: number;
    sort?: string;
    search?: string;
  }): Promise<{ data: MediumLink[]; pagination: PaginationMeta }> {
    await new Promise(r => setTimeout(r, 220));
    let links = loadLinks();

    // Map legacy or shorthand status parameters if needed
    let targetStatus = params.status || 'awaiting';
    if (targetStatus === 'reviewed') {
      targetStatus = 'discarded_after_review';
    }

    if (targetStatus && targetStatus !== 'all') {
      links = links.filter(l => l.status === targetStatus);
    }

    // Search filter
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      links = links.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.authorName.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q)
      );
    }

    // Sort
    const sort = params.sort || 'priority';
    links = [...links].sort((a, b) => {
      if (sort === 'priority') return b.priorityScore - a.priorityScore;
      if (sort === 'newest') return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime();
      if (sort === 'oldest') return new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime();
      if (sort === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

    // Pagination
    const page = Number(params.page) || 1;
    const perPage = Number(params.perPage) || 10;
    const total = links.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));

    const startIndex = (page - 1) * perPage;
    const paginated = links.slice(startIndex, startIndex + perPage);

    return {
      data: paginated,
      pagination: {
        total,
        page,
        perPage,
        lastPage
      }
    };
  },

  async updateLinkStatus(id: string, status: LinkStatus): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 150));
    const links = loadLinks();
    const index = links.findIndex(l => l.id === id);
    if (index !== -1) {
      links[index].status = status;
      saveLinks(links);
      return { success: true, message: `Status updated to ${status}` };
    }
    throw new Error('Link not found');
  }
};
