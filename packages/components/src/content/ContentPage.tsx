import React from 'react';

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      <div className="text-muted-foreground text-sm leading-relaxed [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3">
        {children}
      </div>
    </div>
  );
}

interface ContentPageProps {
  id?: string;
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function ContentPage({ id, title, lastUpdated, children }: ContentPageProps) {
  return (
    <section id={id} className="py-12 md:py-20">
      <div className="container-main max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
        {lastUpdated && <p className="text-sm text-muted-foreground mb-8">Last updated: {lastUpdated}</p>}
        {children}
      </div>
    </section>
  );
}
