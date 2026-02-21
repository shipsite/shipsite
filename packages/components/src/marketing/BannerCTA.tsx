import React from 'react';
import { Section } from '../ui/section';
import { Button } from '../ui/button';
import Glow from '../ui/glow';

interface BannerCTAProps {
  title: string;
  buttonText: string;
  buttonHref?: string;
  subtext?: string;
  children?: React.ReactNode;
}

export function BannerCTA({ title, buttonText, buttonHref, subtext, children }: BannerCTAProps) {
  return (
    <Section>
      <div className="container-main">
        <div className="relative overflow-hidden glass-4 rounded-3xl p-12 md:p-16 text-center">
          <Glow variant="center" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
            {subtext && <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{subtext}</p>}
            {buttonHref && (
              <Button asChild size="lg">
                <a href={buttonHref}>{buttonText}</a>
              </Button>
            )}
            {children}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function BannerFeature({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      {icon && <span>{icon}</span>}
      <span>{title}</span>
    </div>
  );
}
