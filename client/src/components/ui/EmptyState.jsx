import React from 'react';
import { RiInboxArchiveLine } from 'react-icons/ri';

const EmptyState = ({
  title = 'No records found',
  description = 'Try adding some entries to see your tracking logs.',
  icon,
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full mb-4">
        {icon || <RiInboxArchiveLine className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
        {title}
      </h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mt-1 mb-6">
        {description}
      </p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
