'use client';

import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../ui/accordion';

interface BlogFAQProps {
  title: string;
  items: Array<{ question: string; answer: string }>;
}

export function BlogFAQ({ title, items }: BlogFAQProps) {
  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      <Accordion type="single" collapsible>
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <div className="text-muted-foreground leading-relaxed">{item.answer}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
