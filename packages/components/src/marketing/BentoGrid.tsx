import React from 'react';
import { Section } from '../ui/section';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

/* ---------------------------------------------------------------------------
 * Abstract visual decorations
 * Pure CSS, theme-aware (uses `primary`), product-agnostic.
 * -------------------------------------------------------------------------*/

function VisualAurora() {
  return (
    <div className="relative h-32 overflow-hidden rounded-xl">
      <div className="absolute -top-10 -left-10 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-8 right-4 h-32 w-32 rounded-full bg-primary/30 blur-2xl" />
      <div className="absolute top-2 left-1/3 h-24 w-48 rounded-full bg-primary/10 blur-2xl" />
    </div>
  );
}

function VisualOrbs() {
  return (
    <div className="relative h-32 overflow-hidden">
      <div className="absolute top-1 right-6 h-24 w-24 rounded-full border border-primary/20 bg-primary/5" />
      <div className="absolute -bottom-2 left-10 h-20 w-20 rounded-full border border-primary/15 bg-primary/10" />
      <div className="absolute top-6 left-1/4 h-28 w-28 rounded-full border border-primary/10 bg-primary/5" />
    </div>
  );
}

function VisualRings() {
  return (
    <div className="relative h-32 flex items-center justify-center overflow-hidden">
      <div className="absolute h-44 w-44 rounded-full border border-primary/5" />
      <div className="absolute h-32 w-32 rounded-full border border-primary/10" />
      <div className="absolute h-20 w-20 rounded-full border border-primary/15 bg-primary/5" />
      <div className="absolute h-8 w-8 rounded-full bg-primary/20" />
    </div>
  );
}

function VisualDots() {
  const opacities = [10, 20, 5, 15, 25, 15, 5, 20, 10, 25, 10, 15, 20, 5, 20];
  return (
    <div className="grid grid-cols-5 gap-3 px-2 py-4">
      {opacities.map((op, i) => (
        <div
          key={i}
          className="aspect-square rounded-full bg-primary"
          style={{ opacity: op / 100 }}
        />
      ))}
    </div>
  );
}

type BentoVisual = 'aurora' | 'orbs' | 'rings' | 'dots';

const bentoVisuals: Record<BentoVisual, React.FC> = {
  aurora: VisualAurora,
  orbs: VisualOrbs,
  rings: VisualRings,
  dots: VisualDots,
};

/* ---------------------------------------------------------------------------
 * BentoItem
 * -------------------------------------------------------------------------*/

interface BentoItemProps {
  title: string;
  description?: string;
  image?: ImageSource;
  visual?: string;
  span?: 1 | 2;
  children?: React.ReactNode;
}

export function BentoItem({ title, description, image, visual, span = 1, children }: BentoItemProps) {
  const Visual = visual ? bentoVisuals[visual as BentoVisual] : null;

  return (
    <div className={cn(
      'glass-1 hover:glass-2 rounded-2xl p-6 md:p-8 transition-all overflow-hidden flex flex-col',
      'hover:-translate-y-0.5 hover:shadow-lg',
      span === 2 && 'md:col-span-2',
    )}>
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>}
      {Visual && (
        <div className="mt-auto pt-2">
          <Visual />
        </div>
      )}
      {image && (
        <div className="mt-auto -mx-6 -mb-6 md:-mx-8 md:-mb-8">
          <ThemeImage src={image} alt={title} className="w-full" />
        </div>
      )}
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * BentoGrid
 * -------------------------------------------------------------------------*/

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
      </div>
    </Section>
  );
}
