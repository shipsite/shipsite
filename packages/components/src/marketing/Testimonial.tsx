import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  image?: string;
  company?: string;
}

export function Testimonial({ quote, author, role, image, company }: TestimonialProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
      <blockquote className="text-lg text-[var(--ss-text)]/80 italic mb-6">&ldquo;{quote}&rdquo;</blockquote>
      <div className="flex items-center gap-3">
        {image && <img src={image} alt={author} className="w-10 h-10 rounded-full object-cover" />}
        <div>
          <p className="font-semibold text-[var(--ss-text)]">{author}</p>
          {(role || company) && <p className="text-sm text-[var(--ss-text)]/50">{role}{role && company && ' \u00B7 '}{company}</p>}
        </div>
      </div>
    </div>
  );
}
