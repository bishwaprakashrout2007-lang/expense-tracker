import React from 'react';

const Select = React.forwardRef(
  (
    {
      label,
      id,
      error,
      options = [],
      className = '',
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}
          <select
            id={id}
            ref={ref}
            className={`w-full glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-850 dark:text-slate-100 appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer ${
              icon ? 'pl-11' : ''
            } ${
              error
                ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/20 dark:border-rose-500/50'
                : 'border-slate-200 dark:border-slate-700/60'
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundSize: '1.25rem',
            }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
