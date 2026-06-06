import React from 'react';
import Card from './Card';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

const StatCard = ({ title, value, icon, description, trend, trendType = 'up', loading = false }) => {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md mt-1" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
              {value}
            </h3>
          )}
        </div>
        <div className="p-3 bg-brand-500/10 dark:bg-brand-400/10 rounded-xl text-brand-650 dark:text-brand-400">
          {icon}
        </div>
      </div>
      
      {(trend || description) && (
        <div className="flex items-center mt-4">
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold mr-1.5 ${
                trendType === 'up'
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {trendType === 'up' ? (
                <HiTrendingUp className="mr-0.5 w-4 h-4" />
              ) : (
                <HiTrendingDown className="mr-0.5 w-4 h-4" />
              )}
              {trend}
            </span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {description}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
