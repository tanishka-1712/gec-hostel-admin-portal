import React from 'react';

export type BadgeVariant = 'blue' | 'green' | 'red' | 'orange' | 'gray' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray', 
  className = '',
  icon
}) => {
  const variantClass = {
    blue: 'badge-blue',
    green: 'badge-green',
    red: 'badge-red',
    orange: 'badge-orange',
    gray: 'badge-gray',
    purple: 'badge-purple'
  }[variant];

  return (
    <span className={`${variantClass} ${className}`}>
      {icon && <span className="w-3.5 h-3.5 inline-flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
};
