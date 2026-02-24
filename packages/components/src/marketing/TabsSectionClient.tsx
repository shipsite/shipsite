'use client';

import React, { useState } from 'react';
import { Section } from '../ui/section';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface TabItemProps {
  label: string;
  title?: string;
  description?: string;
  image?: ImageSource;
}

interface TabsSectionClientProps {
  id?: string;
  title?: string;
  description?: string;
  tabs: TabItemProps[];
}

export function TabsSectionClient({ id, title, description, tabs }: TabsSectionClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTab = tabs[activeIndex];

  return (
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full glass-1 p-1 gap-1">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  i === activeIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {activeTab && (
          <div className="glass-1 rounded-2xl p-8 md:p-12">
            <div className={cn('grid gap-8', activeTab.image && 'md:grid-cols-2 items-center')}>
              <div>
                {activeTab.title && (
                  <h3 className="text-2xl font-bold text-foreground mb-4">{activeTab.title}</h3>
                )}
                {activeTab.description && (
                  <p className="text-muted-foreground leading-relaxed">{activeTab.description}</p>
                )}
              </div>
              {activeTab.image && (
                <ThemeImage src={activeTab.image} alt={activeTab.title || activeTab.label} className="w-full rounded-xl" />
              )}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
