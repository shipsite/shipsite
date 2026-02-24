import React from 'react';
import { Section } from '../ui/section';

interface BlogIndexProps {
  id?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function BlogIndex({ id, title, description, children }: BlogIndexProps) {
  return (
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </Section>
  );
}
