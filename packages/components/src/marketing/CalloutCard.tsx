import React from 'react';
import { cn } from '../lib/utils';

interface CalloutCardProps {
  id?: string;
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning';
  children?: React.ReactNode;
}

export function CalloutCard({ id, title, description, variant = 'info', children }: CalloutCardProps) {
  const accentStyles = {
    info: 'border-l-primary',
    success: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
  };

  return (
    <div id={id} className={cn('mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)] my-8')}>
      <div className={cn('glass-1 rounded-xl border-l-4 p-6 shadow-xl', accentStyles[variant])}>
        <h3 className="font-semibold tracking-tight text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-balance">{description}</p>
        {children}
      </div>
    </div>
  );
}
