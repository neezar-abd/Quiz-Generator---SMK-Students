import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ 
  label, 
  error, 
  className = '',
  id,
  ...props 
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || `textarea-${generatedId}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-black"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          block w-full px-3 py-2 
          border border-black/15 
          focus:outline-none focus:ring-1 focus:ring-black focus:border-black
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-vertical
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