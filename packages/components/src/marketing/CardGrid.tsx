import React from 'react';

interface CardGridItemProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
}

export function CardGridItem({ title, description, icon, href }: CardGridItemProps) {
  const Wrapper = href ? 'a' : 'div';
  return (
    <Wrapper {...(href ? { href } : {})} className="block p-6 rounded-xl glass-1 hover:glass-2 transition-all">
      {icon && <div className="mb-3 text-primary">{icon}</div>}
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Wrapper>
  );
}

interface CardGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function CardGrid({ columns = 3, children }: CardGridProps) {
  const gridCols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 lg:grid-cols-4' };
  return <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6 py-8`}>{children}</div>;
}
