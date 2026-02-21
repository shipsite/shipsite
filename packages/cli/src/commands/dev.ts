import { join } from 'path';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  readFileSync,
} from 'fs';
import { spawn } from 'child_process';

export async function dev() {
  const rootDir = process.cwd();
  const configPath = join(rootDir, 'shipsite.json');

  if (!existsSync(configPath)) {
    console.error('Error: shipsite.json not found in current directory');
    process.exit(1);
  }

  console.log('\n  Starting ShipSite dev server...\n');

  // 1. Generate .shipsite workspace
  generateWorkspace(rootDir);

  // 2. Generate slug map
  const { generateSlugMap } = await import(
    '@shipsite/core/generate-slug-map'
  );
  const shipSiteDir = join(rootDir, '.shipsite');
  const slugMap = generateSlugMap(rootDir);
  writeFileSync(
    join(shipSiteDir, 'slug-map.json'),
    JSON.stringify(slugMap, null, 2),
  );
  console.log(
    `  Generated slug-map.json (${Object.keys(slugMap).length} entries)`,
  );

  // 3. Start next dev
  console.log('\n  Starting Next.js dev server...\n');
  const nextDev = spawn('npx', ['next', 'dev'], {
    cwd: shipSiteDir,
    stdio: 'inherit',
    env: { ...process.env, SHIPSITE_ROOT: rootDir },
  });

  nextDev.on('close', (code) => {
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
  });
}

function generateWorkspace(rootDir: string) {
  const config = JSON.parse(
    readFileSync(join(rootDir, 'shipsite.json'), 'utf-8'),
  );
  const shipSiteDir = join(rootDir, '.shipsite');

  if (!existsSync(shipSiteDir)) {
    mkdirSync(shipSiteDir, { recursive: true });
  }

  const locales = config.i18n?.locales || ['en'];
  const defaultLocale = config.i18n?.defaultLocale || 'en';
  const localePrefix = config.i18n?.localePrefix || 'as-needed';
  const colors = config.colors || {};
  const primary = colors.primary || '#5d5bd4';
  const accent = colors.accent || '#067647';
  const background = colors.background || '#ffffff';
  const text = colors.text || '#1f2a37';

  // Symlink content directory
  const contentLink = join(shipSiteDir, 'content');
  if (!existsSync(contentLink)) {
    symlinkSync(join(rootDir, 'content'), contentLink);
  }

  // Symlink public directory
  const publicLink = join(shipSiteDir, 'public');
  if (!existsSync(publicLink) && existsSync(join(rootDir, 'public'))) {
    symlinkSync(join(rootDir, 'public'), publicLink);
  }

  // Generate next.config.ts
  writeFileSync(
    join(shipSiteDir, 'next.config.ts'),
    `import createNextIntlPlugin from 'next-intl/plugin';
import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withContentCollections(withNextIntl(nextConfig));
`,
  );

  // Generate content-collections.ts
  writeFileSync(
    join(shipSiteDir, 'content-collections.ts'),
    `import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

const sitePages = defineCollection({
  name: 'sitePages',
  directory: 'content',
  include: '**/*.mdx',
  schema: z.object({
    content: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),
    date: z.string().optional(),
    image: z.string().optional(),
    readingTime: z.number().optional(),
    featured: z.boolean().optional(),
    author: z.string().optional(),
    slug: z.string().optional(),
  }),
  transform: (doc) => {
    const locale = doc._meta.fileName.replace(/\\.mdx$/, '');
    const contentFolder = doc._meta.directory;
    const contentId = doc._meta.path.replace(/\\.mdx$/, '');
    const path = doc._meta.directory;
    let kind: string;
    if (path.startsWith('blog/')) {
      kind = path.split('/').length > 1 ? 'blog-article' : 'blog-index';
    } else {
      kind = 'page';
    }
    const raw = doc.content;
    const match = raw.match(/<BlogIntro>\\s*([\\s\\S]*?)\\s*<\\/BlogIntro>/);
    const excerpt = match
      ? match[1].replace(/\\*\\*(.*?)\\*\\*/g, '$1').replace(/\\[(.*?)\\]\\(.*?\\)/g, '$1').replace(/[*_~\\\`]/g, '').replace(/\\n+/g, ' ').trim()
      : '';
    return { ...doc, locale, contentFolder, contentId, kind, excerpt, body: { raw: doc.content } };
  },
});

export default defineConfig({ content: [sitePages] });
`,
  );

  // Generate src directory structure
  const srcDir = join(shipSiteDir, 'src');
  mkdirSync(join(srcDir, 'i18n'), { recursive: true });
  mkdirSync(join(srcDir, 'app', '[locale]', '[[...slug]]'), {
    recursive: true,
  });
  mkdirSync(join(srcDir, 'styles'), { recursive: true });

  // i18n/routing.ts
  writeFileSync(
    join(srcDir, 'i18n', 'routing.ts'),
    `import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ${JSON.stringify(locales)},
  defaultLocale: '${defaultLocale}',
  localePrefix: '${localePrefix}',
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
`,
  );

  // i18n/request.ts
  writeFileSync(
    join(srcDir, 'i18n', 'request.ts'),
    `import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }
  return { locale, messages: {} };
});
`,
  );

  // middleware.ts
  writeFileSync(
    join(srcDir, 'middleware.ts'),
    `import { createShipSiteMiddleware } from '@shipsite/core/middleware';
import slugMap from '../slug-map.json';

const middleware = createShipSiteMiddleware({
  locales: ${JSON.stringify(locales)},
  defaultLocale: '${defaultLocale}',
  localePrefix: '${localePrefix}',
  slugMap: slugMap as Record<string, Record<string, string>>,
});

export default middleware;

// Next.js requires config to be a static object literal (not imported)
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)'],
};
`,
  );

  // globals.css
  writeFileSync(
    join(srcDir, 'styles', 'globals.css'),
    `@import 'tailwindcss';

:root {
  --ss-primary: ${primary};
  --ss-accent: ${accent};
  --ss-background: ${background};
  --ss-text: ${text};
}

body {
  background-color: var(--ss-background);
  color: var(--ss-text);
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

html { scroll-behavior: smooth; }

.container-main {
  width: 100%;
  max-width: 76rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 3rem);
}

@layer utilities {
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-100% - var(--marquee-gap))); }
  }
  .animate-marquee {
    flex-shrink: 0;
    animation: marquee var(--marquee-duration, 30s) linear infinite;
  }
}

.page-prose > h2, .page-prose > h3, .page-prose > h4,
.page-prose > p, .page-prose > ul, .page-prose > ol,
.page-prose > blockquote {
  width: 100%;
  max-width: 76rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 3rem);
}
.page-prose > h2 { margin-top: 2.5rem; margin-bottom: 1rem; font-size: clamp(1.375rem, 1.1rem + 1.2vw, 2.25rem); font-weight: 600; }
.page-prose > h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: clamp(1.125rem, 1rem + 0.6vw, 1.5rem); font-weight: 600; }
.page-prose > p { font-size: 1rem; line-height: 1.6; margin-top: 0.5rem; margin-bottom: 0.5rem; }
.page-prose > ul { list-style: disc; padding-left: 1.75rem; margin-block: 0.75rem; }
.page-prose > ol { list-style: decimal; padding-left: 1.75rem; margin-block: 0.75rem; }
.page-prose > p a { color: var(--ss-primary); text-decoration: underline; font-weight: 500; }
.page-prose > p a:hover { text-decoration: none; }
`,
  );

  // layout.tsx
  writeFileSync(
    join(srcDir, 'app', '[locale]', 'layout.tsx'),
    `import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { ShipSiteProvider } from '@shipsite/components/context';
import { Header, Footer } from '@shipsite/components';
import { generateNavLinks, generateAlternatePathMap, getConfig, getSiteUrl } from '@shipsite/core';
import '../../styles/globals.css';
import type { Metadata, Viewport } from 'next';

const config = getConfig();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: config.name, template: '%s | ' + config.name },
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

  return (
    <html lang={locale}>
      <body>
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
          navigation: config.navigation || { items: [] },
          footer: config.footer || {},
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
      </body>
    </html>
  );
}
`,
  );

  // page.tsx
  writeFileSync(
    join(srcDir, 'app', '[locale]', '[[...slug]]', 'page.tsx'),
    `import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getPageContent } from '@shipsite/core/mdx';
import { getPageBySlug, generateAllStaticParams, buildCanonicalUrl, getAlternateUrls, isNoIndexPage } from '@shipsite/core/pages';
import { resolveAuthor } from '@shipsite/core/blog';
import { getConfig, getSiteUrl } from '@shipsite/core/config';
import * as Components from '@shipsite/components';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export async function generateStaticParams() {
  return generateAllStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const slugPath = slug?.join('/') || '';
  const pageConfig = getPageBySlug(slugPath, locale);
  if (!pageConfig) return {};

  try {
    const { frontmatter } = await getPageContent(pageConfig.content, locale, Components);
    const canonicalUrl = buildCanonicalUrl(locale, slugPath);
    const config = getConfig();
    const languages = getAlternateUrls(pageConfig);

    return {
      title: slugPath === '' ? { absolute: frontmatter.title } : frontmatter.title,
      description: frontmatter.description,
      ...(isNoIndexPage(pageConfig) && { robots: { index: false, follow: true } }),
      alternates: { canonical: canonicalUrl, languages },
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.description,
        url: canonicalUrl,
        siteName: config.name,
        locale,
        type: pageConfig.type === 'blog-article' ? 'article' : 'website',
      },
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const slugPath = slug?.join('/') || '';
  setRequestLocale(locale);

  const pageConfig = getPageBySlug(slugPath, locale);
  if (!pageConfig) notFound();

  let content;
  try {
    const result = await getPageContent(pageConfig.content, locale, Components);
    content = result.content;
  } catch (error) {
    console.error('MDX content error:', error);
    notFound();
  }

  return <div className="page-prose">{content}</div>;
}
`,
  );

  // sitemap.ts
  writeFileSync(
    join(srcDir, 'app', 'sitemap.ts'),
    `import sitemap from '@shipsite/core/sitemap';
export default sitemap;
`,
  );

  // robots.ts
  writeFileSync(
    join(srcDir, 'app', 'robots.ts'),
    `import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@shipsite/core/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: getSiteUrl() + '/sitemap.xml',
  };
}
`,
  );

  // tsconfig.json
  writeFileSync(
    join(shipSiteDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: {
            '@/*': ['./src/*'],
            'content-collections': ['./.content-collections/generated'],
          },
        },
        include: [
          'next-env.d.ts',
          '**/*.ts',
          '**/*.tsx',
          '.next/types/**/*.ts',
        ],
        exclude: ['node_modules'],
      },
      null,
      2,
    ),
  );

  // package.json for workspace
  // Dependencies resolve from the parent project's node_modules via Node resolution
  writeFileSync(
    join(shipSiteDir, 'package.json'),
    JSON.stringify(
      {
        name: 'shipsite-workspace',
        private: true,
        type: 'module',
      },
      null,
      2,
    ),
  );

  // postcss.config.mjs
  writeFileSync(
    join(shipSiteDir, 'postcss.config.mjs'),
    `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`,
  );

  console.log('  Generated .shipsite workspace');
}
