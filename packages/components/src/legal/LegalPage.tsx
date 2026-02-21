import React from 'react';

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[var(--ss-text)] mb-4">{title}</h2>
      <div className="text-[var(--ss-text)]/70 text-sm leading-relaxed [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3">
        {children}
      </div>
    </div>
  );
}

interface LegalPageProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <section className="py-12 md:py-20">
      <div className="container-main max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--ss-text)] mb-2">{title}</h1>
        {lastUpdated && <p className="text-sm text-[var(--ss-text)]/50 mb-8">Last updated: {lastUpdated}</p>}
        {children}
      </div>
    </section>
  );
}
