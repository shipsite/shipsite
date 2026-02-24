'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from '../ui/section';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface CarouselItemProps {
  title?: string;
  description?: string;
  image?: ImageSource;
  children?: React.ReactNode;
}

export function CarouselItem({ title, description, image, children }: CarouselItemProps) {
  return (
    <div className="glass-1 rounded-2xl overflow-hidden flex-shrink-0 w-[85vw] max-w-[400px] snap-center">
      {image && <ThemeImage src={image} alt={title || ''} className="w-full aspect-video object-cover" />}
      <div className="p-6">
        {title && <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
        {children}
      </div>
    </div>
  );
}

interface CarouselProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Carousel({ title, description, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <Section>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {children}
          </div>
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft className="size-5 text-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight className="size-5 text-foreground" />
          </button>
        </div>
      </div>
    </Section>
  );
}
