import { memo, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = memo<CardProps>(function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-black/10 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
});

export const CardHeader = memo<CardProps>(function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-black/10 ${className}`}>
      {children}
    </div>
  );
});

export const CardContent = memo<CardProps>(function CardContent({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
});

export const CardFooter = memo<CardProps>(function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-black/10 ${className}`}>
      {children}
    </div>
  );
});

export default Card;