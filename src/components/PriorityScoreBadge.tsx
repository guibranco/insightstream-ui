import React from 'react';

interface PriorityScoreBadgeProps {
  score: number;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityScoreBadge: React.FC<PriorityScoreBadgeProps> = ({
  score,
  showBar = true,
  size = 'md',
}) => {
  const normalized = Math.min(10, Math.max(0, score));

  let colorStyle = {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    barBg: 'bg-emerald-500',
    label: 'High Priority',
  };

  if (normalized < 4.0) {
    colorStyle = {
      bg: 'bg-slate-500/10 dark:bg-slate-500/20',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-400/30',
      barBg: 'bg-slate-400 dark:bg-slate-500',
      label: 'Low Priority',
    };
  } else if (normalized < 7.0) {
    colorStyle = {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      barBg: 'bg-amber-500',
      label: 'Medium Priority',
    };
  }

  const badgeSizeClasses =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1 text-sm font-bold'
      : 'px-2 py-0.5 text-xs font-semibold';

  return (
    <div className="flex flex-col gap-1 inline-flex shrink-0">
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-md border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} ${badgeSizeClasses}`}
          title={`Priority score: ${score.toFixed(1)}/10 (${colorStyle.label})`}
        >
          <span className="font-mono">{score.toFixed(1)}</span>
          <span className="text-[10px] opacity-75">/10</span>
        </span>
      </div>

      {showBar && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorStyle.barBg} transition-all duration-300 rounded-full`}
            style={{ width: `${(normalized / 10) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
