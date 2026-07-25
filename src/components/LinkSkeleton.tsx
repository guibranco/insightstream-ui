import React from 'react';

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2" />
      <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
    </div>
  );
};

export const LinkCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs animate-pulse flex flex-col justify-between h-56">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-3" />
        <div className="h-5 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md mb-3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export const NewsletterListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>
          </div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      ))}
    </div>
  );
};
