import React from 'react';
import { Section } from '../ui/section';

interface SocialProofProps {
  id?: string;
  avatars?: string[];
  text: string;
  subtext?: string;
}

export function SocialProof({ id, avatars, text, subtext }: SocialProofProps) {
  return (
    <Section id={id} className="py-12">
      <div className="container-main">
        <div className="flex flex-col items-center gap-4 text-center">
          {avatars && avatars.length > 0 && (
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-background bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">+</span>
              </div>
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-foreground">{text}</p>
            {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </div>
    </Section>
  );
}
