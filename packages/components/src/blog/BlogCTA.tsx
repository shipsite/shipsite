import React from 'react';

interface BlogCTAProps {
  title: string;
  buttonText: string;
  buttonHref: string;
}

export function BlogCTA({ title, buttonText, buttonHref }: BlogCTAProps) {
  return (
    <div className="my-10 p-8 rounded-2xl bg-[var(--ss-primary-50)] border border-[var(--ss-primary-100)] text-center">
      <h3 className="text-xl font-bold text-[var(--ss-text)] mb-4">{title}</h3>
      <a href={buttonHref} className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-[var(--ss-primary)] hover:bg-[var(--ss-primary-600)] transition-colors">
        {buttonText}
      </a>
    </div>
  );
}
