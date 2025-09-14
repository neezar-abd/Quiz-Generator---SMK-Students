import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ 
  label, 
  error, 
  className = '',
  id,
  ...props 
}: InputProps) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-black"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          block w-full px-3 py-2 
          border border-black/15 
          focus:outline-none focus:ring-1 focus:ring-black focus:border-black
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}