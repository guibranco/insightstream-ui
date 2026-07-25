export type LinkStatus = 'awaiting' | 'liked' | 'discarded' | 'discarded_after_review';

export interface MediumLink {
  id: string;
  url: string;
  title: string;
  authorName: string;
  firstSeen: string; // ISO date string
  priorityScore: number; // 0 to 10
  status: LinkStatus;
  newsletterCount: number;
}

export interface Newsletter {
  id: string;
  title: string;
  receivedDate: string; // ISO date string
}

export interface StatusCounts {
  awaiting: number;
  liked: number;
  discarded: number;
  discardedAfterReview: number;
}

export interface StatsData {
  statusCounts: StatusCounts;
  recentNewsletters: Newsletter[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface LinksResponse {
  success: boolean;
  data: MediumLink[];
  pagination: PaginationMeta;
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}

export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ViewMode = 'grid' | 'list';

export interface UserPreferences {
  theme: ThemeMode;
  defaultViewMode: ViewMode;
  itemsPerPage: number;
}
