import React from 'react';
import { Section } from '../ui/section';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface GalleryItemProps {
  src: ImageSource;
  alt: string;
  caption?: string;
}

export function GalleryItem({ src, alt, caption }: GalleryItemProps) {
  return (
    <figure className="group overflow-hidden rounded-xl glass-1">
      <div className="overflow-hidden">
        <ThemeImage
          src={src}
          alt={alt}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {caption && (
        <figcaption className="p-4 text-sm text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

interface GalleryProps {
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export function Gallery({ title, description, columns = 3, children }: GalleryProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
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
        <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>{children}</div>
      </div>
    </Section>
  );
}
