import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '' 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium';
  
  const variants = {
    default: 'bg-black text-white',
    outline: 'border border-black text-black',
    secondary: 'bg-black/10 text-black'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs rounded',
    md: 'px-3 py-1 text-sm rounded-md'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
}