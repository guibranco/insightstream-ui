import React, { useEffect, useState } from 'react';
import { statsApi, linksApi } from '../services/apiClient';
import { StatsData, MediumLink, LinkStatus } from '../types';
import { LinkCard } from '../components/LinkCard';
import { StatCardSkeleton, LinkCardSkeleton, NewsletterListSkeleton } from '../components/LinkSkeleton';
import { ErrorState } from '../components/ErrorState';
import { useToast } from '../context/ToastContext';
import {
  Inbox,
  Heart,
  Trash2,
  EyeOff,
  Sparkles,
  Mail,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [prioritizedLinks, setPrioritizedLinks] = useState<MediumLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, priorityRes] = await Promise.all([
        statsApi.getStats(),
        linksApi.getPrioritized(),
      ]);
      setStats(statsRes.data);
      setPrioritizedLinks(priorityRes.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: LinkStatus) => {
    // Find target link for optimistic update & undo
    const targetLink = prioritizedLinks.find((l) => l.id === id);
    if (!targetLink) return;

    const previousStatus = targetLink.status;

    // Optimistically remove or update in state
    setPrioritizedLinks((prev) => prev.filter((l) => l.id !== id));

    // Optimistically update stats count
    if (stats) {
      setStats((prevStats) => {
        if (!prevStats) return prevStats;
        const newCounts = { ...prevStats.statusCounts };
        if (previousStatus === 'awaiting' && newCounts.awaiting > 0) newCounts.awaiting--;
        if (newStatus === 'liked') newCounts.liked++;
        else if (newStatus === 'discarded') newCounts.discarded++;
        else if (newStatus === 'discarded_after_review') newCounts.discardedAfterReview++;
        return { ...prevStats, statusCounts: newCounts };
      });
    }

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
        `Moved to ${statusLabels[newStatus] || newStatus}`,
        'success',
        'Undo',
        async () => {
          // Undo rollback action
          setPrioritizedLinks((prev) => [targetLink, ...prev]);
          await linksApi.updateStatus(id, previousStatus);
          loadDashboardData();
        }
      );
    } catch (err) {
      // Rollback state on failure
      setPrioritizedLinks((prev) => [targetLink, ...prev]);
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  const greeting = getTimeOfDayGreeting();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-purple/10 via-brand-purple/5 to-transparent p-6 rounded-3xl border border-brand-purple/20">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-purple dark:text-purple-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-lime" />
            Curator Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, Reader
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Here is your daily Medium newsletter breakdown and AI recommended reading queue.
          </p>
        </div>

        <a
          href="#/links/awaiting"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-purple hover:bg-brand-purple-dark text-white text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 shrink-0"
        >
          <span>Start Triaging</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* 4 Stat Cards */}
      <section aria-label="Overview metrics">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Newsletter Status Overview
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Awaiting Card */}
              <a
                href="#/links/awaiting"
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Awaiting
                  </span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-brand-purple dark:text-purple-300 group-hover:scale-110 transition-transform">
                    <Inbox className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {stats?.statusCounts.awaiting ?? 0}
                </div>
                <div className="text-xs font-medium text-brand-purple dark:text-purple-400 flex items-center gap-1">
                  <span>Pending triage</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              {/* Liked Card */}
              <a
                href="#/links/liked"
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Liked
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {stats?.statusCounts.liked ?? 0}
                </div>
                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>Saved favorites</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              {/* Discarded Card */}
              <a
                href="#/links/discarded"
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Discarded
                  </span>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {stats?.statusCounts.discarded ?? 0}
                </div>
                <div className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span>Skipped articles</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              {/* Reviewed / Discarded After Review Card */}
              <a
                href="#/links/discarded_after_review"
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Reviewed
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <EyeOff className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {stats?.statusCounts.discardedAfterReview ?? 0}
                </div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span>Skimmed & closed</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </>
          )}
        </div>
      </section>

      {/* Main Grid: Top Priority Articles & Recent Newsletters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Priority Recommendations (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-purple" />
                Top Priority for You
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highest scoring articles extracted from today's newsletter digests.
              </p>
            </div>

            <a
              href="#/links/awaiting"
              className="text-xs font-bold text-brand-purple dark:text-purple-300 hover:underline flex items-center gap-1"
            >
              View All ({stats?.statusCounts.awaiting ?? 0})
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LinkCardSkeleton />
              <LinkCardSkeleton />
            </div>
          ) : prioritizedLinks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200/80 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                No pending priority links
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You have triaged all top priority articles for now!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prioritizedLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  viewMode="grid"
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updatingId === link.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Newsletters Feed (1 column on lg) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-lime-dark dark:text-brand-lime" />
              Recent Newsletters
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ingested Medium email digests
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            {isLoading ? (
              <NewsletterListSkeleton />
            ) : !stats?.recentNewsletters || stats.recentNewsletters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No newsletters ingested yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentNewsletters.map((nl) => (
                  <div
                    key={nl.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/50 dark:border-slate-800 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                        {nl.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(nl.receivedDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
