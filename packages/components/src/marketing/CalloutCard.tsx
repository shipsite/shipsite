import React from 'react';

interface CalloutCardProps {
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning';
  children?: React.ReactNode;
}

export function CalloutCard({ title, description, variant = 'info', children }: CalloutCardProps) {
  const variantStyles = {
    info: 'bg-[var(--ss-primary-50)] border-[var(--ss-primary-200)]',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  return (
    <div className={`rounded-xl border p-6 my-8 ${variantStyles[variant]}`}>
      <h3 className="font-semibold text-[var(--ss-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--ss-text)]/70">{description}</p>
      {children}
    </div>
  );
}
