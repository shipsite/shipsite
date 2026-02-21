import React from 'react';

interface BlogTipProps {
  title?: string;
  children: React.ReactNode;
}

export function BlogTip({ title = 'Tip', children }: BlogTipProps) {
  return (
    <div className="my-6 p-5 rounded-lg bg-emerald-50 border border-emerald-200">
      <p className="font-semibold text-emerald-700 text-sm mb-1">{title}</p>
      <div className="text-sm text-[var(--ss-text)]/70">{children}</div>
    </div>
  );
}
