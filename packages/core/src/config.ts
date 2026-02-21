import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Schema ────────────────────────────────────────────────────
const NavigationItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const NavigationSchema = z.object({
  items: z.array(NavigationItemSchema),
  cta: NavigationItemSchema.optional(),
});

const FooterColumnSchema = z.object({
  title: z.string(),
  links: z.array(z.object({ label: z.string(), href: z.string() })),
});

const SocialLinkSchema = z.object({
  platform: z.string(),
  href: z.string(),
});

const FooterSchema = z.object({
  columns: z.array(FooterColumnSchema).optional(),
  social: z.array(SocialLinkSchema).optional(),
  copyright: z.string().optional(),
});

const PageConfigSchema = z.object({
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

const ShipSiteConfigSchema = z.object({
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
  analytics: z
    .object({
      googleTagManager: z.string().optional(),
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
