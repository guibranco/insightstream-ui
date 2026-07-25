import React from 'react';
import { Inbox, SearchX, CheckCircle, Heart, EyeOff, Trash2 } from 'lucide-react';
import { LinkStatus } from '../types';

interface EmptyStateProps {
  status?: string;
  hasSearchQuery?: boolean;
  onClearSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  status = 'awaiting',
  hasSearchQuery = false,
  onClearSearch,
}) => {
  if (hasSearchQuery) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-2xs my-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-brand-purple dark:text-purple-300 flex items-center justify-center mx-auto mb-4 border border-purple-200/50 dark:border-purple-800/50">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          No matching articles found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          We couldn't find any links matching your search query. Try searching with different keywords.
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-purple hover:bg-brand-purple-dark text-white shadow-xs transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>
    );
  }

  const getStatusDetails = () => {
    switch (status) {
      case 'liked':
        return {
          icon: <Heart className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/50 dark:border-emerald-800/50',
          title: 'No liked articles yet',
          description: 'Articles you mark as liked will be archived here for future reference and reading.',
        };
      case 'discarded_after_review':
      case 'reviewed':
        return {
          icon: <EyeOff className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
          bgColor: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/50 dark:border-amber-800/50',
          title: 'No reviewed articles',
          description: 'Articles you discard after skimming or reviewing will appear in this review log.',
        };
      case 'discarded':
        return {
          icon: <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />,
          bgColor: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200/50 dark:border-rose-800/50',
          title: 'No discarded articles',
          description: 'Articles you discard directly without opening will be stored here.',
        };
      case 'awaiting':
      default:
        return {
          icon: <CheckCircle className="w-7 h-7 text-brand-purple dark:text-purple-300" />,
          bgColor: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200/50 dark:border-purple-800/50',
          title: 'Inbox zero! All clear.',
          description: 'You have triaged all awaiting newsletter links. New links from daily Medium digests will land here.',
        };
    }
  };

  const details = getStatusDetails();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-2xs my-4 max-w-md mx-auto">
      <div
        className={`w-14 h-14 rounded-2xl ${details.bgColor} flex items-center justify-center mx-auto mb-4 border`}
      >
        {details.icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
        {details.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {details.description}
      </p>
    </div>
  );
};
