import React from 'react';

interface HeroProps {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  badge?: string;
  image?: string;
  children?: React.ReactNode;
}

export function Hero({ title, description, primaryCta, secondaryCta, badge, image, children }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container-main">
        <div className="max-w-3xl mx-auto text-center">
          {badge && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--ss-primary-50)] text-[var(--ss-primary-700)] mb-6">
              {badge}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--ss-text)] mb-6">{title}</h1>
          <p className="text-lg md:text-xl text-[var(--ss-text)]/60 mb-8 max-w-2xl mx-auto">{description}</p>
          <div className="flex items-center justify-center gap-4">
            {primaryCta && (
              <a href={primaryCta.href} className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium text-white bg-[var(--ss-primary)] hover:bg-[var(--ss-primary-600)] transition-colors shadow-lg shadow-[var(--ss-primary)]/25">
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a href={secondaryCta.href} className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium text-[var(--ss-text)] bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                {secondaryCta.label}
              </a>
            )}
          </div>
          {children}
        </div>
        {image && (
          <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <img src={image} alt="" className="w-full" />
          </div>
        )}
      </div>
    </section>
  );
}
