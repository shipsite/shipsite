import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Section } from '../ui/section';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {
  return (
    <details className="border-border dark:border-border/15 border-b group">
      <summary className="flex flex-1 items-center justify-between py-4 text-left text-md font-medium transition-all hover:underline cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </details>
  );
}

interface FAQProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FAQ({ id, title, description, children }: FAQProps) {
  return (
    <Section id={id}>
      <div className="container-main max-w-3xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        <div data-slot="accordion" data-orientation="vertical">
          {children}
        </div>
      </div>
    </Section>
  );
}
