import React from 'react';
import { Button } from '../ui/button';
import Glow from '../ui/glow';

interface BlogCTABannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export function BlogCTABanner({ title, description, buttonText, buttonLink }: BlogCTABannerProps) {
  return (
    <div className="my-12 rounded-2xl glass-4 p-10 text-center relative overflow-hidden">
      <Glow variant="center" />
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{description}</p>
        <Button asChild>
          <a href={buttonLink}>{buttonText}</a>
        </Button>
      </div>
    </div>
  );
}
