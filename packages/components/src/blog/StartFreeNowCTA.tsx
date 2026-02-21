import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';

interface StartFreeNowCTAProps {
  title: string;
  bullets: string[];
  buttonText: string;
  buttonHref: string;
}

export function StartFreeNowCTA({ title, bullets, buttonText, buttonHref }: StartFreeNowCTAProps) {
  return (
    <div className="my-12 p-8 rounded-2xl glass-3">
      <h3 className="text-xl font-bold text-foreground mb-4">{title}</h3>
      <ul className="space-y-2 mb-6">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>
      <Button asChild>
        <a href={buttonHref}>{buttonText}</a>
      </Button>
    </div>
  );
}
