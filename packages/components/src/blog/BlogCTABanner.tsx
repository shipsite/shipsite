import React from 'react';

interface BlogCTABannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export function BlogCTABanner({ title, description, buttonText, buttonLink }: BlogCTABannerProps) {
  return (
    <div className="my-12 rounded-2xl bg-[var(--ss-primary)] p-10 text-center text-white">
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/80 mb-6 max-w-lg mx-auto">{description}</p>
      <a href={buttonLink} className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium bg-white text-[var(--ss-primary)] hover:bg-white/90 transition-colors">
        {buttonText}
      </a>
    </div>
  );
}
