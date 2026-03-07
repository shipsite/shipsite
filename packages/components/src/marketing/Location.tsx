import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Section } from '../ui/section';

interface LocationItemProps {
  name: string;
  mapUrl: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: { day: string; hours: string }[];
  mapHeight?: number;
}

export function LocationItem(_props: LocationItemProps) {
  return null;
}

interface LocationProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Location({ id, title, description, children }: LocationProps) {
  const items: LocationItemProps[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === LocationItem) {
      items.push(child.props as LocationItemProps);
    }
  });

  if (items.length === 0) return null;

  return (
    <Section id={id}>
      <div className="container-main max-w-5xl">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="space-y-12">
          {items.map((item, i) => {
            const hasInfo = item.address || item.phone || item.email || (item.hours && item.hours.length > 0);
            return (
              <div key={i} className="glass-1 rounded-2xl overflow-hidden">
                <div className="p-6 pb-0">
                  <h3 className="text-xl font-semibold text-foreground mb-4">{item.name}</h3>
                </div>
                <div className="px-6">
                  <iframe
                    src={item.mapUrl}
                    width="100%"
                    height={item.mapHeight ?? 400}
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map: ${item.name}`}
                    className="rounded-xl"
                  />
                </div>
                {hasInfo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {item.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item.address}</span>
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                        <a href={`tel:${item.phone}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring rounded-sm">
                          {item.phone}
                        </a>
                      </div>
                    )}
                    {item.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                        <a href={`mailto:${item.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring rounded-sm">
                          {item.email}
                        </a>
                      </div>
                    )}
                    {item.hours && item.hours.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Clock className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                        <dl className="text-sm text-muted-foreground space-y-1">
                          {item.hours.map((h, j) => (
                            <div key={j} className="flex gap-2">
                              <dt className="font-medium text-foreground">{h.day}</dt>
                              <dd>{h.hours}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
