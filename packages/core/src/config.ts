import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Schema ────────────────────────────────────────────────────
const LocalizedString = z.union([z.string(), z.record(z.string())]);

const NavigationItemSchema = z.object({
  label: LocalizedString,
  href: z.string(),
});

const NavigationSchema = z.object({
  items: z.array(NavigationItemSchema),
  cta: NavigationItemSchema.optional(),
});

const FooterColumnSchema = z.object({
  title: LocalizedString,
  links: z.array(z.object({ label: LocalizedString, href: z.string() })),
});

const SocialLinkSchema = z.object({
  platform: z.string(),
  href: z.string(),
});

const FooterSchema = z.object({
  columns: z.array(FooterColumnSchema).optional(),
  social: z.array(SocialLinkSchema).optional(),
  copyright: LocalizedString.optional(),
});

export const PageConfigSchema = z.object({
  slug: z.string(),
  type: z.string(),
  content: z.string(),
  locales: z.array(z.string()).optional(),
});

const AuthorSchema = z.object({
  name: z.string(),
  role: z.union([z.string(), z.record(z.string())]).optional(),
  image: z.string().optional(),
  bio: z.union([z.string(), z.record(z.string())]).optional(),
});

const BlogConfigSchema = z
  .object({
    authors: z.record(AuthorSchema).optional(),
    categories: z
      .array(
        z.object({
          key: z.string(),
          label: z.record(z.string()),
        }),
      )
      .optional(),
    categoryMap: z.record(z.string()).optional(),
  })
  .optional();

const CustomScriptSchema = z
  .object({
    src: z.string().optional(),
    content: z.string().optional(),
    strategy: z
      .enum(['afterInteractive', 'beforeInteractive', 'lazyOnload'])
      .default('afterInteractive'),
    location: z.enum(['head', 'body']).default('head'),
  })
  .refine((s) => s.src || s.content, {
    message: 'Script must have either "src" or "content"',
  });

const RedirectSchema = z.object({
  source: z.string().startsWith('/'),
  destination: z.string(),
  permanent: z.boolean().default(true),
});

export const ShipSiteConfigSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  url: z.string().url(),
  logo: z
    .union([z.string(), z.object({ light: z.string(), dark: z.string() })])
    .optional(),
  favicon: z.string().optional(),
  ogImage: z.string().optional(),
  colors: z
    .object({
      primary: z.string(),
      accent: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional(),
    })
    .optional(),
  fonts: z
    .object({
      heading: z.string().optional(),
      body: z.string().optional(),
    })
    .optional(),
  i18n: z
    .object({
      defaultLocale: z.string().default('en'),
      locales: z.array(z.string()).default(['en']),
      localePrefix: z
        .enum(['as-needed', 'always', 'never'])
        .default('as-needed'),
    })
    .optional(),
  navigation: NavigationSchema.optional(),
  footer: FooterSchema.optional(),
  pages: z.array(PageConfigSchema),
  blog: BlogConfigSchema,
  redirects: z.array(RedirectSchema).optional().default([]),
  analytics: z
    .object({
      vercel: z.boolean().optional(),
      cloudflare: z.string().optional(),
      googleTagManager: z.string().optional(),
      googleAnalytics: z.string().optional(),
      plausible: z.union([z.boolean(), z.string()]).optional(),
      posthog: z
        .object({
          apiKey: z.string(),
          apiHost: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  scripts: z.array(CustomScriptSchema).optional(),
  seo: z
    .object({
      llmsTxt: z.boolean().optional().default(true),
    })
    .optional(),
});

export type ShipSiteConfig = z.infer<typeof ShipSiteConfigSchema>;
export type PageConfig = z.infer<typeof PageConfigSchema>;

// ─── Singleton ─────────────────────────────────────────────────
let _config: ShipSiteConfig | null = null;

export function loadConfig(rootDir?: string): ShipSiteConfig {
  if (_config) return _config;

  const dir = rootDir || process.env.SHIPSITE_ROOT || process.cwd();
  const configPath = join(dir, 'shipsite.json');
  const raw = readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw);
  _config = ShipSiteConfigSchema.parse(parsed);
  return _config;
}

export function getConfig(): ShipSiteConfig {
  if (!_config) {
    return loadConfig();
  }
  return _config;
}

export function getSiteUrl(): string {
  return getConfig().url;
}

export function getLocales(): string[] {
  return getConfig().i18n?.locales ?? ['en'];
}

export function getDefaultLocale(): string {
  return getConfig().i18n?.defaultLocale ?? 'en';
}

export function getLocalePrefix(): string {
  return getConfig().i18n?.localePrefix ?? 'as-needed';
}
