'use client';

import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button className="w-full flex items-center justify-between py-5 text-left" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-base font-medium text-[var(--ss-text)]">{question}</span>
        <svg className={`w-5 h-5 text-[var(--ss-text)]/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-5 text-[var(--ss-text)]/60 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}

interface FAQProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FAQ({ title, description, children }: FAQProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-main max-w-3xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>}
            {description && <p className="text-lg text-[var(--ss-text)]/60">{description}</p>}
          </div>
        )}
        <div>{children}</div>
      </div>
    </section>
  );
}
