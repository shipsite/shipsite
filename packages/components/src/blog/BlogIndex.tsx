import React from 'react';

interface BlogIndexProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function BlogIndex({ title, description, children }: BlogIndexProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>}
            {description && <p className="text-lg text-[var(--ss-text)]/60">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
