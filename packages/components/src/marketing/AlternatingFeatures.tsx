import React from 'react';

interface AlternatingFeatureItemProps {
  icon?: string;
  title: string;
  description: string;
}

export function AlternatingFeatureItem({ icon, title, description }: AlternatingFeatureItemProps) {
  return (
    <div className="flex gap-3 items-start">
      {icon && <span className="text-[var(--ss-primary)] text-xl mt-0.5">{icon}</span>}
      <div>
        <h4 className="font-semibold text-[var(--ss-text)] mb-1">{title}</h4>
        <p className="text-sm text-[var(--ss-text)]/60">{description}</p>
      </div>
    </div>
  );
}

interface AlternatingFeatureRowProps {
  title: string;
  description?: string;
  image: string;
  imageAlt?: string;
  children?: React.ReactNode;
}

export function AlternatingFeatureRow({ title, description, image, imageAlt, children }: AlternatingFeatureRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12 [&:nth-child(even)>div:first-child]:md:order-2">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-[var(--ss-text)] mb-4">{title}</h3>
        {description && <p className="text-[var(--ss-text)]/60 mb-6">{description}</p>}
        {children && <div className="space-y-4">{children}</div>}
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <img src={image} alt={imageAlt || title} className="w-full" />
      </div>
    </div>
  );
}

interface AlternatingFeaturesProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AlternatingFeatures({ title, description, children }: AlternatingFeaturesProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>}
            {description && <p className="text-lg text-[var(--ss-text)]/60 max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className="divide-y divide-gray-100">{children}</div>
      </div>
    </section>
  );
}
