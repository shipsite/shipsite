import React from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHero({ title, description, badge, children }: PageHeroProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-main text-center">
        {badge && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--ss-primary-50)] text-[var(--ss-primary-700)] mb-4">
            {badge}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--ss-text)] mb-4">{title}</h1>
        {description && <p className="text-lg text-[var(--ss-text)]/60 max-w-2xl mx-auto">{description}</p>}
        {children}
      </div>
    </section>
  );
}
