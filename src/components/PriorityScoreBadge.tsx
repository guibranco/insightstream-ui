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
    bg: 'bg-[#93CD3F]/10 dark:bg-[#93CD3F]/20',
    text: 'text-[#5d8d1e] dark:text-[#93CD3F]',
    border: 'border-[#93CD3F]/30',
    barBg: 'bg-[#93CD3F]',
    label: 'High Priority',
  };

  if (normalized < 4.0) {
    colorStyle = {
      bg: 'bg-slate-500/10 dark:bg-white/5',
      text: 'text-slate-600 dark:text-gray-400',
      border: 'border-slate-400/20 dark:border-white/10',
      barBg: 'bg-slate-400 dark:bg-gray-500',
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
      ? 'px-2 py-0.5 text-xs font-bold'
      : size === 'lg'
      ? 'px-3.5 py-1 text-sm font-bold'
      : 'px-2.5 py-1 text-xs font-bold';

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
        <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorStyle.barBg} transition-all duration-300 rounded-full`}
            style={{ width: `${(normalized / 10) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
