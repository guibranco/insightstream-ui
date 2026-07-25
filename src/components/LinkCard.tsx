import React from 'react';
import { MediumLink, LinkStatus, ViewMode } from '../types';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { Heart, EyeOff, X, ExternalLink, RotateCcw, Mail, Clock, User } from 'lucide-react';

interface LinkCardProps {
  link: MediumLink;
  viewMode?: ViewMode;
  onUpdateStatus: (id: string, newStatus: LinkStatus) => void;
  isUpdating?: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  viewMode = 'grid',
  onUpdateStatus,
  isUpdating = false,
}) => {
  const isAwaiting = link.status === 'awaiting';

  if (viewMode === 'list') {
    return (
      <div
        className={`group relative bg-white dark:bg-[#16191F] rounded-xl p-4 border border-slate-200/80 dark:border-white/5 shadow-2xs hover:bg-slate-50 dark:hover:bg-[#1E2229] hover:border-[#79378B]/30 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isUpdating ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <PriorityScoreBadge score={link.priorityScore} showBar={false} size="sm" />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200/50 dark:border-white/5">
              <Mail className="w-3 h-3 text-[#79378B] dark:text-[#93CD3F]" />
              {link.newsletterCount} {link.newsletterCount === 1 ? 'edition' : 'editions'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500 ml-auto md:ml-0">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(link.firstSeen)}
            </span>
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-slate-900 dark:text-white hover:text-[#79378B] dark:hover:text-[#93CD3F] transition-colors line-clamp-1 inline-flex items-center gap-1.5 group-hover:underline"
          >
            {link.title}
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {link.authorName || 'Medium Author'}
            </span>
          </div>
        </div>

        {/* Priority Bar Indicator */}
        <div className="w-full md:w-32 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1 md:hidden">
            <span>Priority Score</span>
            <span className="font-semibold text-[#93CD3F]">{link.priorityScore.toFixed(1)}/10</span>
          </div>
          <PriorityScoreBadge score={link.priorityScore} showBar={true} size="sm" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 shrink-0">
          {isAwaiting ? (
            <>
              <button
                onClick={() => onUpdateStatus(link.id, 'liked')}
                aria-label="Like article"
                title="Like article"
                className="flex-1 md:flex-none p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#79378B]/20 border border-emerald-200/60 dark:border-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span className="text-xs font-semibold md:hidden">Like</span>
              </button>

              <button
                onClick={() => onUpdateStatus(link.id, 'discarded_after_review')}
                aria-label="Discard after review"
                title="Discard after review"
                className="flex-1 md:flex-none p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200/60 dark:border-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
                <span className="text-xs font-semibold md:hidden">Reviewed</span>
              </button>

              <button
                onClick={() => onUpdateStatus(link.id, 'discarded')}
                aria-label="Discard article"
                title="Discard article"
                className="flex-1 md:flex-none p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-200/60 dark:border-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span className="text-xs font-semibold md:hidden">Discard</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onUpdateStatus(link.id, 'awaiting')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#79378B] dark:text-[#93CD3F] hover:bg-purple-50 dark:hover:bg-[#79378B]/20 border border-[#79378B]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore to Awaiting
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid Card Mode
  return (
    <div
      className={`group relative bg-white dark:bg-[#16191F] rounded-2xl p-5 border border-slate-200/80 dark:border-white/5 shadow-xs hover:bg-slate-50/80 dark:hover:bg-[#1E2229] hover:border-[#79378B]/30 transition-all duration-200 flex flex-col justify-between h-full ${
        isUpdating ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div>
        {/* Top bar: Score badge & Newsletter appearances */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <PriorityScoreBadge score={link.priorityScore} showBar={false} size="md" />

          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full shrink-0 border border-slate-200/50 dark:border-white/5">
            <Mail className="w-3 h-3 text-[#79378B] dark:text-[#93CD3F]" />
            {link.newsletterCount} {link.newsletterCount === 1 ? 'edition' : 'editions'}
          </span>
        </div>

        {/* Priority Visual Progress Bar */}
        <div className="mb-3">
          <PriorityScoreBadge score={link.priorityScore} showBar={true} size="sm" />
        </div>

        {/* Article Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-[#79378B] dark:group-hover:text-[#93CD3F] transition-colors">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus:outline-hidden inline-flex items-center gap-1 hover:underline"
          >
            {link.title}
            <ExternalLink className="w-3.5 h-3.5 shrink-0 inline text-slate-400 group-hover:text-[#79378B] dark:group-hover:text-[#93CD3F] transition-colors ml-0.5" />
          </a>
        </h3>

        {/* Author & Timestamp */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mt-2 pb-4">
          <span className="inline-flex items-center gap-1 truncate max-w-[160px]" title={link.authorName}>
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {link.authorName || 'Medium Author'}
          </span>
          <span className="inline-flex items-center gap-1 shrink-0 text-slate-400 dark:text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeTime(link.firstSeen)}
          </span>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
        {isAwaiting ? (
          <>
            <button
              onClick={() => onUpdateStatus(link.id, 'liked')}
              aria-label="Like article"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-white/5 dark:hover:bg-[#79378B] text-emerald-700 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200/50 dark:border-white/10"
            >
              <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-[#93CD3F]" />
              Like
            </button>

            <button
              onClick={() => onUpdateStatus(link.id, 'discarded_after_review')}
              aria-label="Discard after review"
              title="Discard after review"
              className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-white/5 dark:hover:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-amber-200/50 dark:border-white/10"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Reviewed
            </button>

            <button
              onClick={() => onUpdateStatus(link.id, 'discarded')}
              aria-label="Discard article"
              title="Discard article"
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-white/5 dark:hover:bg-rose-500/20 text-slate-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors cursor-pointer border border-slate-200/60 dark:border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onUpdateStatus(link.id, 'awaiting')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-[#79378B]/20 text-[#79378B] dark:text-[#93CD3F] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-200/60 dark:border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore to Awaiting
          </button>
        )}
      </div>
    </div>
  );
};
