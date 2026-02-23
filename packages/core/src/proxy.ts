import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';

/**
 * Create ShipSite proxy (Next.js "proxy" file convention, formerly "middleware").
 * Must be called with the slug-map and locale config.
 */
export function createShipSiteProxy(options: {
  locales: string[];
  defaultLocale: string;
  localePrefix: 'as-needed' | 'always' | 'never';
  slugMap: Record<string, Record<string, string>>;
}) {
  const { locales, defaultLocale, localePrefix, slugMap } = options;

  const routing = defineRouting({
    locales,
    defaultLocale,
    localePrefix,
  });

  const intlMiddleware = createMiddleware(routing);

  const nonDefaultLocales = locales.filter((l) => l !== defaultLocale);
  const localePattern = new RegExp(
    `^/(${nonDefaultLocales.join('|')})(/.*)?$`,
  );

  function remapSlug(locale: string, enSlug: string): string | null {
    const entry = slugMap[enSlug];
    if (entry?.[locale] && entry[locale] !== enSlug) {
      return `/${locale}/${entry[locale]}`;
    }
    return null;
  }

  return function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Case 1: Direct visit with EN slug under a non-default locale prefix
    const localeMatch = pathname.match(localePattern);
    if (localeMatch) {
      const locale = localeMatch[1];
      const slug = (localeMatch[2] || '').replace(/^\//, '');
      const corrected = remapSlug(locale, slug);
      if (corrected) {
        const url = request.nextUrl.clone();
        url.pathname = corrected;
        return NextResponse.redirect(url, 308);
      }
    }

    // Run next-intl middleware
    const response = intlMiddleware(request);

    // Case 2: next-intl redirected to /{locale}/{en-slug} — correct the slug
    const status = response.status;
    if (status === 307 || status === 308) {
      const location = response.headers.get('location');
      if (location) {
        try {
          const url = new URL(location, request.url);
          const redirectMatch = url.pathname.match(localePattern);
          if (redirectMatch) {
            const locale = redirectMatch[1];
            const slug = (redirectMatch[2] || '').replace(/^\//, '');
            const corrected = remapSlug(locale, slug);
            if (corrected) {
              url.pathname = corrected;
              return NextResponse.redirect(url, 308);
            }
          }
        } catch {
          // Invalid URL — let the original redirect pass through
        }
      }
    }

    return response;
  };
}

export const proxyConfig = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
