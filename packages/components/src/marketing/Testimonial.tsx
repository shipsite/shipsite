import React from 'react';
import { Section } from '../ui/section';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface TestimonialProps {
  id?: string;
  quote: string;
  author: string;
  role?: string;
  image?: ImageSource;
  company?: string;
}

export function Testimonial({ id, quote, author, role, image, company }: TestimonialProps) {
  return (
    <Section id={id}>
      <div className="container-main max-w-3xl">
        <div className="glass-2 rounded-2xl p-8 md:p-12">
          <blockquote className="text-lg md:text-xl text-foreground/80 italic mb-6">&ldquo;{quote}&rdquo;</blockquote>
          <div className="flex items-center gap-3">
            {image && <ThemeImage src={image} alt={author} className="w-10 h-10 rounded-full object-cover" />}
            <div>
              <p className="font-semibold text-foreground">{author}</p>
              {(role || company) && <p className="text-sm text-muted-foreground">{role}{role && company && ' \u00B7 '}{company}</p>}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
