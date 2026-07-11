import React from 'react';

const ProgressBar = ({ value, max = 100, label, suffix = '%' }) => {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  
  const getColor = (pct) => {
    if (pct >= 100) return 'bg-rose-500 dark:bg-rose-500';
    if (pct >= 85) return 'bg-amber-500 dark:bg-amber-500';
    return 'bg-emerald-500 dark:bg-emerald-500';
  };

  const getTextColor = (pct) => {
    if (pct >= 100) return 'text-rose-500 dark:text-rose-400';
    if (pct >= 85) return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-500 dark:text-emerald-400';
  };

  return (
    <div className="w-full">
      {(label || value !== undefined) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
          <span>{label}</span>
          <span className={getTextColor(percentage)}>
            {value.toLocaleString()} / {max.toLocaleString()}{suffix}
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
