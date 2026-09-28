import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-zinc-300 dark:border-zinc-700 focus:border-[#009dff] focus:ring-[#009dff]/20'
        } rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all outline-none focus:ring-4 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
