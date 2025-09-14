import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Container({ 
  children, 
  className = '',
  size = 'lg' 
}: ContainerProps) {
  const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };
  
  const classes = `${sizes[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}