import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateLayout(ctx: GeneratorContext): void {
  const favicon = ctx.config.favicon;
  let iconsBlock = '';
  if (favicon) {
    iconsBlock = `
  icons: {
    icon: '${favicon}',
    apple: '/apple-touch-icon.png',
  },`;
  }

  const analytics = ctx.config.analytics;
  const needsVercel = analytics?.vercel === true;
  const needsCloudflareScript = !!analytics?.cloudflare;
  const needsGtm = !!analytics?.googleTagManager;

  let analyticsImports = '';
  if (needsVercel) {
    analyticsImports += `import { Analytics } from '@vercel/analytics/next';\n`;
  }
  if (needsGtm) {
    analyticsImports += `import { GoogleTagManager } from '@next/third-parties/google';\n`;
  }
  if (needsCloudflareScript) {
    analyticsImports += `import Script from 'next/script';\n`;
  }

  let analyticsHeadComponents = '';
  if (needsGtm) {
    analyticsHeadComponents += `\n      <GoogleTagManager gtmId="${analytics!.googleTagManager}" />`;
  }

  let analyticsBodyComponents = '';
  if (needsVercel) {
    analyticsBodyComponents += `\n          <Analytics />`;
  }
  if (needsCloudflareScript) {
    analyticsBodyComponents += `\n          <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${analytics!.cloudflare}"}' strategy="afterInteractive" />`;
  }

  const defaultLocale = ctx.config.i18n?.defaultLocale || 'en';

  // Root layout — static shell with default lang for /_not-found and other
  // non-locale routes. The [locale] layout overrides <html> for real pages.
  writeFileSync(
    join(ctx.srcDir, 'app', 'layout.tsx'),
    `import '../styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="${defaultLocale}" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
`,
  );

  // Locale layout — owns <html lang={locale}>, <body>, providers, header/footer.
  writeFileSync(
    join(ctx.srcDir, 'app', '[locale]', 'layout.tsx'),
    `import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { ShipSiteProvider } from '@shipsite.dev/components/context';
import { ThemeProvider } from '@shipsite.dev/components/theme';
import { Header, Footer } from '@shipsite.dev/components';
import { generateNavLinks, generateAlternatePathMap, getConfig, getSiteUrl } from '@shipsite.dev/core';
import '../../styles/globals.css';
import type { Metadata, Viewport } from 'next';
${analyticsImports}

const config = getConfig();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: config.name, template: '%s | ' + config.name },${iconsBlock}
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
    <html lang={locale} suppressHydrationWarning>${analyticsHeadComponents}
      <body>
        <ThemeProvider>
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
        </ThemeProvider>${analyticsBodyComponents}
      </body>
    </html>
  );
}
`,
  );
}
