import React from 'react';
import { Button } from '../ui/button';

interface BlogCTAProps {
  title: string;
  buttonText: string;
  buttonHref: string;
}

export function BlogCTA({ title, buttonText, buttonHref }: BlogCTAProps) {
  return (
    <div className="my-10 p-8 rounded-2xl glass-1 text-center">
      <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
      <Button asChild>
        <a href={buttonHref}>{buttonText}</a>
      </Button>
    </div>
  );
}
