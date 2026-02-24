import React from 'react';
import { Section } from '../ui/section';
import { Mockup } from '../ui/mockup';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface AlternatingFeatureItemProps {
  icon?: string;
  title: string;
  description: string;
}

export function AlternatingFeatureItem({ icon, title, description }: AlternatingFeatureItemProps) {
  return (
    <div className="flex gap-3 items-start">
      {icon && <span className="text-primary text-xl mt-0.5">{icon}</span>}
      <div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface AlternatingFeatureRowProps {
  title: string;
  description?: string;
  image: ImageSource;
  imageAlt?: string;
  children?: React.ReactNode;
}

export function AlternatingFeatureRow({ title, description, image, imageAlt, children }: AlternatingFeatureRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12 [&:nth-child(even)>div:first-child]:md:order-2">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h3>
        {description && <p className="text-muted-foreground mb-6">{description}</p>}
        {children && <div className="space-y-4">{children}</div>}
      </div>
      <Mockup type="responsive">
        <ThemeImage src={image} alt={imageAlt || title} className="w-full" />
      </Mockup>
    </div>
  );
}

interface AlternatingFeaturesProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AlternatingFeatures({ id, title, description, children }: AlternatingFeaturesProps) {
  return (
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-16">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </div>
        )}
        <div className="divide-y divide-border">{children}</div>
      </div>
    </Section>
  );
}
