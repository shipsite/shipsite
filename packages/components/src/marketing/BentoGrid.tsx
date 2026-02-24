import React from 'react';
import { Section } from '../ui/section';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface BentoItemProps {
  title: string;
  description?: string;
  image?: ImageSource;
  span?: 1 | 2;
  children?: React.ReactNode;
}

export function BentoItem({ title, description, image, span = 1, children }: BentoItemProps) {
  return (
    <div className={cn(
      'glass-1 hover:glass-2 rounded-2xl p-6 md:p-8 transition-all overflow-hidden flex flex-col',
      span === 2 && 'md:col-span-2',
    )}>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>}
      {image && (
        <div className="mt-auto -mx-6 -mb-6 md:-mx-8 md:-mb-8">
          <ThemeImage src={image} alt={title} className="w-full" />
        </div>
      )}
      {children}
    </div>
  );
}

interface BentoGridProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function BentoGrid({ id, title, description, children }: BentoGridProps) {
  return (
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">{children}</div>
      </div>
    </Section>
  );
}
