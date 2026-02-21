import React from 'react';

interface FeatureProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex flex-col items-start p-6 rounded-xl bg-white border border-gray-100 hover:border-[var(--ss-primary-200)] hover:shadow-lg transition-all">
      {icon && (
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--ss-primary-50)] text-[var(--ss-primary)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--ss-text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--ss-text)]/60 leading-relaxed">{description}</p>
    </div>
  );
}

interface FeaturesProps {
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function Features({ title, description, columns = 3, children }: FeaturesProps) {
  const gridCols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };

  return (
    <section className="py-16 md:py-24">
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>}
            {description && <p className="text-lg text-[var(--ss-text)]/60 max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>{children}</div>
      </div>
    </section>
  );
}
