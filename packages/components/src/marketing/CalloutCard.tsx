import React from 'react';
import { cn } from '../lib/utils';

interface CalloutCardProps {
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning';
  children?: React.ReactNode;
}

export function CalloutCard({ title, description, variant = 'info', children }: CalloutCardProps) {
  const variantStyles = {
    info: 'bg-primary/5 border-primary/20',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  return (
    <div className={cn('mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)] my-8')}>
    <div className={cn('rounded-xl border p-6', variantStyles[variant])}>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
    </div>
  );
}
