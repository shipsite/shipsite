import { join, relative, dirname } from 'path';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  readFileSync,
  realpathSync,
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

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function generateShadcnTokens(colors: { primary?: string; accent?: string; background?: string; text?: string }): string {
  const primary = colors.primary || '#5d5bd4';
  const accent = colors.accent || '#067647';

  const [pH, pS, pL] = hexToHsl(primary);

  // Light mode
  const brandFgLight = `${pH} ${Math.min(pS + 10, 100)}% ${Math.min(pL + 10, 85)}%`;

  // Dark mode tokens (primary design - Launch UI inspired)
  const darkBgH = pH;
  const darkBgS = Math.min(Math.round(pS * 0.6), 50);
  const darkBg = `${darkBgH} ${darkBgS}% 4%`;
  const darkFg = `0 0% 98%`;
  const darkCard = `${darkBgH} ${darkBgS}% 6%`;
  const darkMuted = `${darkBgH} ${Math.round(darkBgS * 0.8)}% 15%`;
  const darkMutedFg = `${darkBgH} ${Math.round(darkBgS * 0.4)}% 65%`;
  const darkBorder = `${darkBgH} ${Math.round(darkBgS * 0.7)}% 14%`;
  const darkInput = `${darkBgH} ${Math.round(darkBgS * 0.7)}% 18%`;
  const darkRing = `${pH} ${Math.round(pS * 0.5)}% 60%`;
  const darkBrandFg = `${pH} ${Math.min(pS + 10, 100)}% ${Math.min(pL + 15, 80)}%`;

  return `:root {
  --brand: hsl(${pH} ${pS}% ${pL}%);
  --brand-foreground: hsl(${brandFgLight});
  --primary: hsl(${pH} ${pS}% ${pL}%);
  --primary-foreground: hsl(0 0% 98%);
  --background: hsl(0 0% 100%);
  --foreground: hsl(222 47% 11%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222 47% 11%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(222 47% 11%);
  --secondary: hsl(210 10% 93%);
  --secondary-foreground: hsl(222 47% 20%);
  --muted: hsl(210 10% 93%);
  --muted-foreground: hsl(215 15% 45%);
  --accent: hsl(210 10% 90%);
  --accent-foreground: hsl(222 47% 20%);
  --destructive: hsl(0 72% 51%);
  --destructive-foreground: hsl(0 72% 51%);
  --border: hsl(220 9% 91%);
  --input: hsl(220 9% 91%);
  --ring: hsl(215 15% 70%);
  --radius: 0.625rem;
  --line-width: 1px;
  --shadow: #00000008;
  --shadow-strong: #00000010;
  --ss-primary: ${primary};
  --ss-accent: ${accent};
}

.dark {
  --brand: hsl(${pH} ${pS}% ${pL}%);
  --brand-foreground: hsl(${darkBrandFg});
  --primary: hsl(${pH} ${pS}% ${pL}%);
  --primary-foreground: hsl(0 0% 98%);
  --background: hsl(${darkBg});
  --foreground: hsl(${darkFg});
  --card: hsl(${darkCard});
  --card-foreground: hsl(${darkFg});
  --popover: hsl(${darkCard});
  --popover-foreground: hsl(${darkFg});
  --secondary: hsl(${darkMuted});
  --secondary-foreground: hsl(${darkFg});
  --muted: hsl(${darkMuted});
  --muted-foreground: hsl(${darkMutedFg});
  --accent: hsl(${darkMuted});
  --accent-foreground: hsl(${darkFg});
  --destructive: hsl(0 62% 30%);
  --destructive-foreground: hsl(${darkFg});
  --border: hsl(${darkBorder});
  --input: hsl(${darkInput});
  --ring: hsl(${darkRing});
  --radius: 0.625rem;
  --line-width: 1px;
  --shadow: #00000040;
  --shadow-strong: #00000060;
  --ss-primary: ${primary};
  --ss-accent: ${accent};
}
`;
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

  // Symlink custom components directory
  const hasCustomComponents = existsSync(join(rootDir, 'components'));
  const componentsLink = join(shipSiteDir, 'components');
  if (!existsSync(componentsLink) && hasCustomComponents) {
    symlinkSync(join(rootDir, 'components'), componentsLink);
  }

  // Generate next.config.ts
  // Detect user's custom next.config file (always expected, but graceful fallback)
  const userNextConfigExtensions = ['ts', 'mjs', 'js'];
  const userNextConfig = userNextConfigExtensions.find((ext) =>
    existsSync(join(rootDir, `next.config.${ext}`)),
  );

  const userConfigImport = userNextConfig
    ? `import userConfig from '../next.config.${userNextConfig}';\n`
    : '';
  const userConfigSpread = userNextConfig ? '  ...userConfig,\n' : '';

  writeFileSync(
    join(shipSiteDir, 'next.config.ts'),
    `import createNextIntlPlugin from 'next-intl/plugin';
import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from 'next';
${userConfigImport}
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
${userConfigSpread}  reactStrictMode: true,
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

  // Resolve @shipsite/components source path for Tailwind @source directive
  const cssDir = join(srcDir, 'styles');
  let componentsSourceDirective = '';
  let utilsCssImport = '';
  // Walk up from rootDir to find node_modules/@shipsite/components/src
  let searchDir = rootDir;
  for (let i = 0; i < 10; i++) {
    const candidate = join(searchDir, 'node_modules', '@shipsite', 'components', 'src');
    if (existsSync(candidate)) {
      const realPath = realpathSync(candidate);
      const rel = relative(cssDir, realPath).split('\\').join('/');
      componentsSourceDirective = `\n@source "${rel}";`;
      // Also resolve the utils.css path from components
      const utilsCssPath = join(realPath, 'styles', 'utils.css');
      if (existsSync(utilsCssPath)) {
        const utilsRel = relative(cssDir, utilsCssPath).split('\\').join('/');
        utilsCssImport = `\n@import "${utilsRel}";`;
      }
      break;
    }
    const parent = dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }

  // Generate shadcn/ui tokens from config colors
  const shadcnTokens = generateShadcnTokens(config.colors || {});

  // globals.css — full Launch UI compatible stylesheet
  writeFileSync(
    join(cssDir, 'globals.css'),
    `@import 'tailwindcss';${componentsSourceDirective}${utilsCssImport}

@import 'tw-animate-css';

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);

  --spacing-container: 1280px;
  --spacing-container-lg: 1536px;

  --shadow-md: 0 4px 6px -1px var(--shadow), 0 2px 4px -2px var(--shadow);
  --shadow-xl: 0 20px 25px -5px var(--shadow), 0 8px 10px -6px var(--shadow);
  --shadow-2xl: 0 25px 50px -12px var(--shadow);
  --shadow-mockup: -12px 16px 48px var(--shadow-strong);

  --line-width: 1px;

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-appear: appear 0.6s forwards ease-out;
  --animate-appear-zoom: appear-zoom 0.6s forwards ease-out;

  @keyframes accordion-down {
    from { height: 0; }
    to { height: var(--radix-accordion-content-height); }
  }
  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); }
    to { height: 0; }
  }
  @keyframes appear {
    0% { opacity: 0; transform: translateY(1rem); filter: blur(0.5rem); }
    50% { filter: blur(0); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes appear-zoom {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }
}

${shadcnTokens}
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  html { scroll-behavior: smooth; }
}

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
.page-prose > p a { color: var(--primary); text-decoration: underline; font-weight: 500; }
.page-prose > p a:hover { text-decoration: none; }
`,
  );

  // layout.tsx
  writeFileSync(
    join(srcDir, 'app', '[locale]', 'layout.tsx'),
    `import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { ShipSiteProvider } from '@shipsite/components/context';
import { ThemeProvider } from '@shipsite/components/theme';
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
    <html lang={locale} suppressHydrationWarning>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
`,
  );

  // page.tsx
  const customComponentsImport = hasCustomComponents
    ? `import * as CustomComponents from '../../../components';\n`
    : '';
  const allComponentsMerge = hasCustomComponents
    ? 'const AllComponents = { ...Components, ...CustomComponents };\n'
    : 'const AllComponents = Components;\n';

  writeFileSync(
    join(srcDir, 'app', '[locale]', '[[...slug]]', 'page.tsx'),
    `import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getPageContent } from '@shipsite/core/mdx';
import { getPageBySlug, generateAllStaticParams, buildCanonicalUrl, getAlternateUrls, isNoIndexPage } from '@shipsite/core/pages';
import { resolveAuthor } from '@shipsite/core/blog';
import { getConfig, getSiteUrl } from '@shipsite/core/config';
import * as Components from '@shipsite/components';
${customComponentsImport}import type { Metadata } from 'next';

${allComponentsMerge}
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
    const { frontmatter } = await getPageContent(pageConfig.content, locale, AllComponents);
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
    const result = await getPageContent(pageConfig.content, locale, AllComponents);
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
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'GoogleOther', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
    ],
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
