import React from 'react';

interface StartFreeNowCTAProps {
  title: string;
  bullets: string[];
  buttonText: string;
  buttonHref: string;
}

export function StartFreeNowCTA({ title, bullets, buttonText, buttonHref }: StartFreeNowCTAProps) {
  return (
    <div className="my-12 p-8 rounded-2xl bg-gradient-to-br from-[var(--ss-primary-50)] to-white border border-[var(--ss-primary-100)]">
      <h3 className="text-xl font-bold text-[var(--ss-text)] mb-4">{title}</h3>
      <ul className="space-y-2 mb-6">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-[var(--ss-text)]/70">
            <svg className="w-4 h-4 text-[var(--ss-accent)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {bullet}
          </li>
        ))}
      </ul>
      <a href={buttonHref} className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-[var(--ss-primary)] hover:bg-[var(--ss-primary-600)] transition-colors">
        {buttonText}
      </a>
    </div>
  );
}
