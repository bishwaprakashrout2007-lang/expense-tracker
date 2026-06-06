import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      type = 'text',
      id,
      error,
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
          <input
            id={id}
            type={type}
            ref={ref}
            className={`w-full glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-800 dark:text-slate-100 ${
              icon ? 'pl-11' : ''
            } ${
              error
                ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-500/20 dark:border-rose-500/50'
                : 'border-slate-200 dark:border-slate-700/60'
            }`}
            {...props}
          />
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

Input.displayName = 'Input';

export default Input;
