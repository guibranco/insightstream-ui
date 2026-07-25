import React, { useEffect, useState, useCallback, useRef } from 'react';
import { linksApi } from '../services/apiClient';
import { MediumLink, LinkStatus, ViewMode, PaginationMeta } from '../types';
import { LinkCard } from '../components/LinkCard';
import { LinkCardSkeleton } from '../components/LinkSkeleton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import { usePreferences } from '../context/PreferencesContext';
import {
  Inbox,
  Heart,
  Trash2,
  EyeOff,
  LayoutGrid,
  List,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface LinksPageProps {
  statusParam?: string;
}

export const LinksPage: React.FC<LinksPageProps> = ({ statusParam }) => {
  const { preferences } = usePreferences();
  const { showToast } = useToast();

  // Normalize status string from route hash or default to awaiting
  const resolveStatus = (raw?: string): LinkStatus => {
    if (!raw) return 'awaiting';
    if (raw === 'reviewed') return 'discarded_after_review';
    if (['awaiting', 'liked', 'discarded', 'discarded_after_review'].includes(raw)) {
      return raw as LinkStatus;
    }
    return 'awaiting';
  };

  const currentStatus = resolveStatus(statusParam);

  const [links, setLinks] = useState<MediumLink[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    perPage: preferences.itemsPerPage || 10,
    lastPage: 1,
  });

  const [viewMode, setViewMode] = useState<ViewMode>(preferences.defaultViewMode || 'grid');
  const [sortOption, setSortOption] = useState<string>('priority');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Debounce search query changes by 300ms
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 300);
  };

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await linksApi.getLinks({
        status: currentStatus,
        page: pagination.page,
        perPage: preferences.itemsPerPage || 10,
        sort: sortOption,
        search: debouncedSearch,
      });

      setLinks(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load newsletter links.');
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, pagination.page, preferences.itemsPerPage, sortOption, debouncedSearch]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // When tab status changes from route, reset to page 1
  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [currentStatus]);

  const handleUpdateStatus = async (id: string, newStatus: LinkStatus) => {
    const targetLink = links.find((l) => l.id === id);
    if (!targetLink) return;

    const previousStatus = targetLink.status;

    // Optimistically update list in place or filter out
    setLinks((prev) => prev.filter((l) => l.id !== id));
    setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));

    setUpdatingId(id);

    try {
      await linksApi.updateStatus(id, newStatus);

      const statusLabels: Record<string, string> = {
        liked: 'Liked',
        discarded: 'Discarded',
        discarded_after_review: 'Reviewed & Discarded',
        awaiting: 'Awaiting',
      };

      showToast(
        `Link moved to ${statusLabels[newStatus] || newStatus}`,
        'success',
        'Undo',
        async () => {
          // Undo rollback
          await linksApi.updateStatus(id, previousStatus);
          fetchLinks();
        }
      );
    } catch (err) {
      // Rollback
      setLinks((prev) => [targetLink, ...prev]);
      setPagination((p) => ({ ...p, total: p.total + 1 }));
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusTabChange = (target: string) => {
    window.location.hash = `#/links/${target}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24 md:pb-12">
      {/* Header & Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Newsletter Articles
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Triage, sort, and search links extracted from Medium newsletter emails.
          </p>
        </div>

        {/* Status Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#16191F] p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => handleStatusTabChange('awaiting')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentStatus === 'awaiting'
                ? 'bg-white dark:bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] border border-[#79378B]/30 shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Awaiting
          </button>

          <button
            onClick={() => handleStatusTabChange('liked')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentStatus === 'liked'
                ? 'bg-white dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Liked
          </button>

          <button
            onClick={() => handleStatusTabChange('discarded')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentStatus === 'discarded'
                ? 'bg-white dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Discarded
          </button>

          <button
            onClick={() => handleStatusTabChange('discarded_after_review')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentStatus === 'discarded_after_review'
                ? 'bg-white dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Reviewed
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, Sort & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input with 300ms Debounce */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search titles, authors, or domain URLs..."
            className="w-full pl-10 pr-9 py-2 bg-white dark:bg-[#16191F] border border-slate-200/80 dark:border-white/10 rounded-full text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#79378B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-white dark:bg-[#16191F] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-gray-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent focus:outline-hidden cursor-pointer font-medium text-slate-900 dark:text-white"
            >
              <option value="priority" className="bg-white dark:bg-[#16191F]">
                Priority Score (High-Low)
              </option>
              <option value="newest" className="bg-white dark:bg-[#16191F]">
                Newest First
              </option>
              <option value="oldest" className="bg-white dark:bg-[#16191F]">
                Oldest First
              </option>
              <option value="title" className="bg-white dark:bg-[#16191F]">
                Title Alphabetical
              </option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#16191F] p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List View"
              title="List View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={fetchLinks} />
      ) : isLoading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          <LinkCardSkeleton />
          <LinkCardSkeleton />
          <LinkCardSkeleton />
          <LinkCardSkeleton />
          <LinkCardSkeleton />
          <LinkCardSkeleton />
        </div>
      ) : links.length === 0 ? (
        <EmptyState
          status={currentStatus}
          hasSearchQuery={Boolean(debouncedSearch)}
          onClearSearch={() => handleSearchChange('')}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              viewMode={viewMode}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingId === link.id}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && !error && pagination.lastPage > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{links.length}</span> of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span> links
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-200">
              Page {pagination.page} of {pagination.lastPage}
            </span>

            <button
              disabled={pagination.page >= pagination.lastPage}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
