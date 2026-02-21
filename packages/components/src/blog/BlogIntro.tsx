import React from 'react';

export function BlogIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-lg text-muted-foreground leading-relaxed mb-8 [&>p]:mb-4">
      {children}
    </div>
  );
}
