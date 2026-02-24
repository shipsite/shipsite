import React from 'react';
import { Section } from '../ui/section';
import { Badge } from '../ui/badge';

interface PageHeroProps {
  id?: string;
  title: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHero({ id, title, description, badge, children }: PageHeroProps) {
  return (
    <Section id={id} className="py-16 md:py-24">
      <div className="container-main text-center">
        {badge && (
          <Badge variant="outline" className="mb-4">
            {badge}
          </Badge>
        )}
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">{title}</h1>
        {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
        {children}
      </div>
    </Section>
  );
}
