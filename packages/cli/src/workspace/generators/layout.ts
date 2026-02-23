import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateLayout(ctx: GeneratorContext): void {
  // Build icons metadata from config
  const favicon = ctx.config.favicon;
  let iconsBlock = '';
  if (favicon) {
    iconsBlock = `
  icons: {
    icon: '${favicon}',
    apple: '/apple-touch-icon.png',
  },`;
  }

  // Root layout — owns <html lang>, <body>, ThemeProvider, global styles.
  // Uses getLocale() from next-intl so the lang attribute is set correctly
  // even though the [locale] segment hasn't been resolved yet at this level.
  writeFileSync(
    join(ctx.srcDir, 'app', 'layout.tsx'),
    `import { getLocale } from 'next-intl/server';
import { ThemeProvider } from '@shipsite.dev/components/theme';
import { getConfig, getSiteUrl } from '@shipsite.dev/core';
import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';

const config = getConfig();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: config.name, template: '%s | ' + config.name },${iconsBlock}
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
`,
  );

  // Locale layout — owns ShipSiteProvider, Header, Footer.
  // Reads locale from [locale] param and resolves localized labels.
  writeFileSync(
    join(ctx.srcDir, 'app', '[locale]', 'layout.tsx'),
    `import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { ShipSiteProvider } from '@shipsite.dev/components/context';
import { Header, Footer } from '@shipsite.dev/components';
import { generateNavLinks, generateAlternatePathMap, getConfig } from '@shipsite.dev/core';

const config = getConfig();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();

  const navLinks = generateNavLinks(locale);
  const alternatePathMap = generateAlternatePathMap();

  const t = (v: string | Record<string, string>) =>
    typeof v === 'string' ? v : (v[locale] || v.en || '');

  const rawNav = config.navigation || { items: [] };
  const navigation = {
    items: rawNav.items.map((i: any) => ({ label: t(i.label), href: i.href })),
    cta: rawNav.cta ? { label: t(rawNav.cta.label), href: rawNav.cta.href } : undefined,
  };

  const rawFooter = config.footer || {};
  const footer = {
    columns: rawFooter.columns?.map((c: any) => ({
      title: t(c.title),
      links: c.links.map((l: any) => ({ label: t(l.label), href: l.href })),
    })),
    social: rawFooter.social,
    copyright: rawFooter.copyright ? t(rawFooter.copyright) : undefined,
  };

  return (
    <ShipSiteProvider value={{
      siteName: config.name,
      siteUrl: config.url,
      logo: config.logo,
      ogImage: config.ogImage,
      colors: {
        primary: config.colors?.primary || '#5d5bd4',
        accent: config.colors?.accent || '#067647',
        background: config.colors?.background || '#ffffff',
        text: config.colors?.text || '#1f2a37',
      },
      navigation,
      footer,
      navLinks,
      alternatePathMap,
      locale,
      locales: config.i18n?.locales || ['en'],
      defaultLocale: config.i18n?.defaultLocale || 'en',
    }}>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </ShipSiteProvider>
  );
}
`,
  );
}
