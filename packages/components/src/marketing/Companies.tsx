import React from 'react';

interface CompaniesProps {
  title?: string;
  logos: Array<{ src: string; alt: string; width?: number }>;
}

export function Companies({ title, logos }: CompaniesProps) {
  return (
    <section className="py-12 overflow-hidden">
      <div className="container-main">
        {title && <p className="text-center text-sm text-[var(--ss-text)]/50 mb-8">{title}</p>}
        <div className="flex gap-12 items-center" style={{ '--marquee-gap': '3rem' } as React.CSSProperties}>
          <div className="flex gap-12 items-center animate-marquee">
            {logos.map((logo, i) => (
              <img key={i} src={logo.src} alt={logo.alt} width={logo.width || 120} className="h-8 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
            ))}
          </div>
          <div className="flex gap-12 items-center animate-marquee" aria-hidden>
            {logos.map((logo, i) => (
              <img key={i} src={logo.src} alt="" width={logo.width || 120} className="h-8 w-auto object-contain grayscale opacity-60" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
