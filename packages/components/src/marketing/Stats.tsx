import React from 'react';
import { Section } from '../ui/section';

interface StatProps {
  label?: string;
  value: string | number;
  suffix?: string;
  description?: string;
}

export function Stat(_props: StatProps) {
  return null;
}

interface StatsProps {
  id?: string;
  title?: string;
  children: React.ReactNode;
}

export function Stats({ id, title, children }: StatsProps) {
  const items: StatProps[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === Stat) {
      items.push(child.props as StatProps);
    }
  });

  return (
    <Section id={id}>
      <div className="container-main max-w-[960px]">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">{title}</h2>
        )}
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-start gap-3 text-left">
              {item.label && (
                <div className="text-muted-foreground text-sm font-semibold">{item.label}</div>
              )}
              <div className="flex items-baseline gap-2">
                <div className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-4xl font-medium text-transparent drop-shadow-[2px_1px_24px_var(--brand-foreground)] transition-all duration-300 sm:text-5xl md:text-6xl">
                  {item.value}
                </div>
                {item.suffix && (
                  <div className="text-brand text-2xl font-semibold">{item.suffix}</div>
                )}
              </div>
              {item.description && (
                <div className="text-muted-foreground text-sm font-semibold text-pretty">{item.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
