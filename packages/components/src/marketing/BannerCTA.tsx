import React from 'react';

interface BannerCTAProps {
  title: string;
  buttonText: string;
  buttonHref?: string;
  subtext?: string;
  children?: React.ReactNode;
}

export function BannerCTA({ title, buttonText, buttonHref, subtext, children }: BannerCTAProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-main">
        <div className="bg-[var(--ss-primary)] rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          {subtext && <p className="text-white/80 mb-8 max-w-xl mx-auto">{subtext}</p>}
          {buttonHref && (
            <a href={buttonHref} className="inline-flex items-center px-8 py-4 rounded-lg text-base font-medium bg-white text-[var(--ss-primary)] hover:bg-white/90 transition-colors shadow-lg">
              {buttonText}
            </a>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function BannerFeature({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-2 text-white/90 text-sm">
      {icon && <span>{icon}</span>}
      <span>{title}</span>
    </div>
  );
}
