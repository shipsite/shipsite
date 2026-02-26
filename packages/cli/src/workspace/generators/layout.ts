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
  const customScripts: { src?: string; content?: string; strategy?: string; location?: string }[] =
    ctx.config.scripts || [];
  const needsVercel = analytics?.vercel === true;
  const needsCloudflareScript = !!analytics?.cloudflare;
  const needsGtm = !!analytics?.googleTagManager;
  const needsGa4 = !!analytics?.googleAnalytics;
  const needsPlausible = !!analytics?.plausible;
  const needsPosthog = !!analytics?.posthog;
  const needsScriptImport =
    needsCloudflareScript || needsGa4 || needsPlausible || needsPosthog || customScripts.length > 0;

  let analyticsImports = '';
  if (needsVercel) {
    analyticsImports += `import { Analytics } from '@vercel/analytics/next';\n`;
  }
  if (needsGtm || needsGa4) {
    const googleImports = [needsGtm && 'GoogleTagManager', needsGa4 && 'GoogleAnalytics']
      .filter(Boolean)
      .join(', ');
    analyticsImports += `import { ${googleImports} } from '@next/third-parties/google';\n`;
  }
  if (needsScriptImport) {
    analyticsImports += `import Script from 'next/script';\n`;
  }

  let analyticsHeadComponents = '';
  if (needsGtm) {
    analyticsHeadComponents += `\n      <GoogleTagManager gtmId="${analytics!.googleTagManager}" />`;
  }
  if (needsGa4) {
    analyticsHeadComponents += `\n      <GoogleAnalytics gaId="${analytics!.googleAnalytics}" />`;
  }

  // Custom scripts for <head>
  for (const s of customScripts.filter((s) => (s.location ?? 'head') === 'head')) {
    if (s.src) {
      analyticsHeadComponents += `\n      <Script src="${s.src}" strategy="${s.strategy || 'afterInteractive'}" />`;
    } else if (s.content) {
      analyticsHeadComponents += `\n      <Script id="custom-${customScripts.indexOf(s)}" strategy="${s.strategy || 'afterInteractive'}" dangerouslySetInnerHTML={{ __html: \`${s.content.replace(/`/g, '\\`')}\` }} />`;
    }
  }

  let analyticsBodyComponents = '';
  if (needsVercel) {
    analyticsBodyComponents += `\n          <Analytics />`;
  }
  if (needsCloudflareScript) {
    analyticsBodyComponents += `\n          <Script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${analytics!.cloudflare}"}' strategy="afterInteractive" />`;
  }
  if (needsPlausible) {
    const plausibleDomain =
      typeof analytics!.plausible === 'string'
        ? analytics!.plausible
        : new URL(ctx.config.url).hostname;
    analyticsBodyComponents += `\n          <Script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.js" strategy="afterInteractive" />`;
  }
  if (needsPosthog) {
    const ph = analytics!.posthog!;
    const apiHost = ph.apiHost || 'https://us.i.posthog.com';
    analyticsBodyComponents += `\n          <Script id="posthog-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: \`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${ph.apiKey}', {api_host: '${apiHost}', person_profiles: 'identified_only'});
          \` }} />`;
  }

  // Custom scripts for <body>
  for (const s of customScripts.filter((s) => s.location === 'body')) {
    if (s.src) {
      analyticsBodyComponents += `\n          <Script src="${s.src}" strategy="${s.strategy || 'afterInteractive'}" />`;
    } else if (s.content) {
      analyticsBodyComponents += `\n          <Script id="custom-${customScripts.indexOf(s)}" strategy="${s.strategy || 'afterInteractive'}" dangerouslySetInnerHTML={{ __html: \`${s.content.replace(/`/g, '\\`')}\` }} />`;
    }
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
            primary: config.colors?.primary || '#059669',
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
