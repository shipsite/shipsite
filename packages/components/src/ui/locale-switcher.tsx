'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useShipSite, useAlternateLinks } from '../context/ShipSiteProvider';

export function LocaleSwitcher() {
  const { locale, locales, defaultLocale } = useShipSite();
  const alternatePathMap = useAlternateLinks();
  const pathname = usePathname();

  if (locales.length <= 1) return null;

  // Normalize pathname: with localePrefix:"as-needed", usePathname() may
  // include the default locale prefix on the server (e.g. /en or /en/page)
  // but alternatePathMap uses paths without it (e.g. / or /page).
  let normalizedPathname = pathname;
  if (pathname === `/${defaultLocale}`) {
    normalizedPathname = '/';
  } else if (pathname.startsWith(`/${defaultLocale}/`)) {
    normalizedPathname = pathname.slice(defaultLocale.length + 1);
  }

  // Find the alternatePathMap entry where the current locale's path matches
  let alternates: Record<string, string> | undefined;
  for (const entry of Object.values(alternatePathMap)) {
    if (entry[locale] === normalizedPathname) {
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
                onClick={() => {
                  document.cookie = `NEXT_LOCALE=${loc}; path=/; max-age=31536000; SameSite=Lax`;
                }}
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
