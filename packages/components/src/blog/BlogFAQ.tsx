'use client';

import React, { useState } from 'react';

interface BlogFAQProps {
  title: string;
  items: Array<{ question: string; answer: string }>;
}

export function BlogFAQ({ title, items }: BlogFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold text-[var(--ss-text)] mb-6">{title}</h2>
      <div className="space-y-0 divide-y divide-gray-200">
        {items.map((item, i) => (
          <div key={i}>
            <button className="w-full flex items-center justify-between py-4 text-left" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span className="font-medium text-[var(--ss-text)] pr-4">{item.question}</span>
              <svg className={`w-5 h-5 shrink-0 text-[var(--ss-text)]/40 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && <div className="pb-4 text-[var(--ss-text)]/60 text-sm leading-relaxed">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
