import React from 'react';
import { Section } from '../ui/section';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
  rating?: number;
}

export function TestimonialCard({ quote, author, role, company, image, rating }: TestimonialCardProps) {
  return (
    <div className="glass-1 hover:glass-2 rounded-2xl p-6 transition-all flex flex-col justify-between gap-4">
      {rating && (
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <svg key={i} className="size-4 fill-brand" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          ))}
        </div>
      )}
      <blockquote className="text-sm text-foreground/80 leading-relaxed">&ldquo;{quote}&rdquo;</blockquote>
      <div className="flex items-center gap-3 mt-auto pt-2">
        {image && <img src={image} alt={author} className="w-8 h-8 rounded-full object-cover" />}
        <div>
          <p className="text-sm font-semibold text-foreground">{author}</p>
          {(role || company) && (
            <p className="text-xs text-muted-foreground">{role}{role && company && ' · '}{company}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface TestimonialsProps {
  title?: string;
  description?: string;
  columns?: 2 | 3;
  children: React.ReactNode;
}

export function Testimonials({ title, description, columns = 3, children }: TestimonialsProps) {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <Section>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>{children}</div>
      </div>
    </Section>
  );
}
