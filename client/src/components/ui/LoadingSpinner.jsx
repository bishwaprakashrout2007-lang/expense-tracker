import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-slate-300 dark:border-slate-700 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
