'use client';

import React from 'react';
import { Section } from '../ui/section';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../ui/accordion';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger>{question}</AccordionTrigger>
      <AccordionContent>
        <div className="text-muted-foreground leading-relaxed">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface FAQProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FAQ({ title, description, children }: FAQProps) {
  return (
    <Section>
      <div className="container-main max-w-3xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        <Accordion type="single" collapsible>
          {children}
        </Accordion>
      </div>
    </Section>
  );
}
