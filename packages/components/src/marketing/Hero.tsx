import React from 'react';
import { cn } from '../lib/utils';
import { Section } from '../ui/section';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Mockup } from '../ui/mockup';
import Glow from '../ui/glow';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface HeroProps {
  id?: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  badge?: string;
  image?: ImageSource;
  size?: 'default' | 'compact';
  children?: React.ReactNode;
}

export function Hero({ id, title, description, primaryCta, secondaryCta, badge, image, size = 'default', children }: HeroProps) {
  const compact = size === 'compact';

  return (
    <Section id={id} className={cn("relative overflow-hidden", compact && "py-8 sm:py-16 md:py-20")}>
      <Glow variant="top" />
      <div className="container-main relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {badge && (
            <Badge variant="outline" className={cn("animate-appear", compact ? "mb-4" : "mb-6")}>
              {badge}
            </Badge>
          )}
          <h1 className={cn(
            "font-bold tracking-tight text-foreground animate-appear [animation-delay:100ms]",
            compact ? "text-3xl md:text-5xl mb-4" : "text-4xl md:text-6xl mb-6",
          )}>
            {title}
          </h1>
          <p className={cn(
            "text-muted-foreground max-w-2xl mx-auto animate-appear [animation-delay:200ms]",
            compact ? "text-base md:text-lg mb-6" : "text-lg md:text-xl mb-8",
          )}>
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
          <div className={cn("animate-appear-zoom [animation-delay:400ms]", compact ? "mt-10" : "mt-16")}>
            <Mockup type="responsive" className="shadow-mockup w-full">
              <ThemeImage src={image} alt="" className="w-full" />
            </Mockup>
          </div>
        )}
      </div>
    </Section>
  );
}
