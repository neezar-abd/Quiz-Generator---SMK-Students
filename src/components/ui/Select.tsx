import React, { useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export default function Select({ 
  label, 
  error, 
  options,
  className = '',
  id,
  ...props 
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-black"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          block w-full px-3 py-2 
          border border-black/15 
          focus:outline-none focus:ring-1 focus:ring-black focus:border-black
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-white
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}