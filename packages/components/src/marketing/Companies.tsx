import React from 'react';
import { Section } from '../ui/section';
import { Badge } from '../ui/badge';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface LogoItem {
  src: ImageSource;
  alt: string;
  width?: number;
  name?: string;
  version?: string;
  badge?: string;
}

interface CompaniesProps {
  id?: string;
  title?: string;
  logos: LogoItem[];
  variant?: 'marquee' | 'inline';
}

export function Companies({ id, title, logos, variant = 'marquee' }: CompaniesProps) {
  if (variant === 'inline') {
    return (
      <Section id={id} className="py-12">
        <div className="container-main flex flex-col items-center gap-8 text-center">
          {title && <h2 className="text-base font-semibold sm:text-2xl text-foreground">{title}</h2>}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium">
                <ThemeImage
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 32}
                  height={logo.width || 32}
                  className={cn("h-6 w-6 object-contain opacity-70", typeof logo.src === 'string' && "dark:invert")}
                />
                {logo.name && <span className={cn(!logo.name && 'sr-only')}>{logo.name}</span>}
                {logo.version && <span className="text-muted-foreground">{logo.version}</span>}
                {logo.badge && (
                  <Badge variant="brand" className="text-xs px-1.5 py-0.5">{logo.badge}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id={id} className="py-12">
      <div className="container-main">
        {title && <p className="text-center text-sm text-muted-foreground mb-8">{title}</p>}
        <div className="relative fade-x overflow-hidden">
          <div className="flex gap-12 items-center" style={{ '--marquee-gap': '3rem' } as React.CSSProperties}>
            <div className="flex gap-12 items-center animate-marquee">
              {logos.map((logo, i) => (
                <ThemeImage key={i} src={logo.src} alt={logo.alt} width={logo.width || 120} className="h-8 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
              ))}
            </div>
            <div className="flex gap-12 items-center animate-marquee" aria-hidden>
              {logos.map((logo, i) => (
                <ThemeImage key={i} src={logo.src} alt="" width={logo.width || 120} className="h-8 w-auto object-contain grayscale opacity-60" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
