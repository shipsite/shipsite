'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useShipSite, useAlternateLinks } from '../context/ShipSiteProvider';

export function LocaleSwitcher() {
  const { locale, locales } = useShipSite();
  const alternatePathMap = useAlternateLinks();
  const pathname = usePathname();

  if (locales.length <= 1) return null;

  // Find the alternatePathMap entry where the current locale's path matches
  let alternates: Record<string, string> | undefined;
  for (const entry of Object.values(alternatePathMap)) {
    if (entry[locale] === pathname) {
      alternates = entry;
      break;
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {locales.map((loc, i) => {
        const href = alternates?.[loc] ?? `/${loc}`;
        const isActive = loc === locale;

        return (
          <React.Fragment key={loc}>
            {i > 0 && <span className="text-muted-foreground">·</span>}
            {isActive ? (
              <span className="font-semibold text-foreground uppercase">
                {loc}
              </span>
            ) : (
              <a
                href={href}
                className="text-muted-foreground hover:text-foreground transition-colors uppercase"
              >
                {loc}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
