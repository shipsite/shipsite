import React from 'react';

export function BlogIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-lg text-[var(--ss-text)]/70 leading-relaxed mb-8 [&>p]:mb-4">
      {children}
    </div>
  );
}
