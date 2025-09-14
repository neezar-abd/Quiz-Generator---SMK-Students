import React from 'react';
import Button from './ui/Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  icon = '📝', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-black/10 mx-auto mb-4 rounded-xl flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-medium text-black mb-2">
        {title}
      </h3>
      <p className="text-black/60 mb-6 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}