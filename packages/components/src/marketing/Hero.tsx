import React from 'react';
import { cn } from '../lib/utils';
import { Section } from '../ui/section';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Mockup } from '../ui/mockup';
import Glow from '../ui/glow';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface HeroProps {
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  badge?: string;
  image?: ImageSource;
  children?: React.ReactNode;
}

export function Hero({ title, description, primaryCta, secondaryCta, badge, image, children }: HeroProps) {
  return (
    <Section className="relative overflow-hidden">
      <Glow variant="top" />
      <div className="container-main relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {badge && (
            <Badge variant="outline" className="animate-appear mb-6">
              {badge}
            </Badge>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-appear [animation-delay:100ms]">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-appear [animation-delay:200ms]">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-appear [animation-delay:300ms]">
            {primaryCta && (
              <Button asChild size="lg">
                <a href={primaryCta.href}>{primaryCta.label}</a>
              </Button>
            )}
            {secondaryCta && (
              <Button asChild variant="glow" size="lg">
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            )}
          </div>
          {children}
        </div>
        {image && (
          <div className="mt-16 animate-appear-zoom [animation-delay:400ms]">
            <Mockup type="responsive" className="shadow-mockup w-full">
              <ThemeImage src={image} alt="" className="w-full" />
            </Mockup>
          </div>
        )}
      </div>
    </Section>
  );
}
