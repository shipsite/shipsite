import { allSitePages } from 'content-collections';
import { getConfig, getSiteUrl, getDefaultLocale, type PageConfig } from './config';

/**
 * Resolve the full URL slug for a content-collections doc.
 */
function resolveDocSlug(
  doc: { slug?: string; contentFolder: string },
  fallbackSlug: string,
): string {
  if (!doc.slug) return fallbackSlug;
  if (doc.slug.includes('/')) return doc.slug;
  const folderParts = doc.contentFolder.split('/');
  const prefix =
    folderParts.length > 1 ? folderParts.slice(0, -1).join('/') + '/' : '';
  return prefix + doc.slug;
}

export function getAllPages(): PageConfig[] {
  return getConfig().pages;
}

export function getPageBySlug(
  slug: string,
  locale: string,
): PageConfig | undefined {
  const pages = getConfig().pages;

  const direct = pages.find((p) => p.slug === slug);
  if (direct) return direct;

  for (const doc of allSitePages) {
    if (doc.locale !== locale || !doc.slug) continue;
    const page = pages.find((p) => p.content === doc.contentFolder);
    const fullSlug = resolveDocSlug(doc, page?.slug ?? '');
    if (fullSlug === slug) {
      return page;
    }
  }

  return undefined;
}

export function pageExists(slug: string, locale: string): boolean {
  return !!getPageBySlug(slug, locale);
}

export function generateAllStaticParams(): {
  locale: string;
  slug?: string[];
}[] {
  const pages = getAllPages();
  const defaultLocale = getDefaultLocale();

  return pages.flatMap((page) => {
    const pageLocales = page.locales || [defaultLocale];

    return pageLocales.map((locale) => {
      const doc = allSitePages.find(
        (d) => d.contentFolder === page.content && d.locale === locale,
      );
      const resolvedSlug = doc ? resolveDocSlug(doc, page.slug) : page.slug;

      return {
        locale,
        slug: resolvedSlug ? resolvedSlug.split('/') : undefined,
      };
    });
  });
}

export function getPagesByType(type: string): PageConfig[] {
  return getConfig().pages.filter((p) => p.type === type);
}

const noIndexTypes = new Set(['legal']);
const noIndexSlugs = new Set(['thank-you']);

export function isNoIndexPage(page: PageConfig): boolean {
  return noIndexTypes.has(page.type) || noIndexSlugs.has(page.slug);
}

export function buildCanonicalUrl(locale: string, slug: string): string {
  const defaultLocale = getDefaultLocale();
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const path = slug ? `/${slug}` : '';
  return `${getSiteUrl()}${prefix}${path}`;
}

export function resolvePageHref(enSlug: string, locale: string): string {
  const pages = getConfig().pages;
  const defaultLocale = getDefaultLocale();
  const page = pages.find((p) => p.slug === enSlug);
  if (!page) {
    return enSlug ? `/${enSlug}` : '/';
  }

  const pageLocales = page.locales || [defaultLocale];
  if (!pageLocales.includes(locale)) {
    return enSlug ? `/${enSlug}` : '/';
  }

  const doc = allSitePages.find(
    (d) => d.contentFolder === page.content && d.locale === locale,
  );
  const resolvedSlug = doc ? resolveDocSlug(doc, page.slug) : page.slug;

  const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
  return resolvedSlug
    ? `${localePrefix}/${resolvedSlug}`
    : localePrefix || '/';
}

export function generateNavLinks(locale: string): Record<string, string> {
  const links: Record<string, string> = {};
  for (const page of getConfig().pages) {
    links[page.slug] = resolvePageHref(page.slug, locale);
  }
  return links;
}

export function generateAlternatePathMap(): Record<
  string,
  Record<string, string>
> {
  const map: Record<string, Record<string, string>> = {};
  const defaultLocale = getDefaultLocale();

  for (const page of getConfig().pages) {
    const pageLocales = page.locales || [defaultLocale];
    const alternates: Record<string, string> = {};

    for (const locale of pageLocales) {
      alternates[locale] = resolvePageHref(page.slug, locale);
    }

    for (const href of Object.values(alternates)) {
      map[href] = alternates;
    }
  }

  return map;
}

export function getAlternateUrls(page: PageConfig): Record<string, string> {
  const languages: Record<string, string> = {};
  const defaultLocale = getDefaultLocale();
  const pageLocales = page.locales || [defaultLocale];

  for (const loc of pageLocales) {
    const doc = allSitePages.find(
      (d) => d.contentFolder === page.content && d.locale === loc,
    );
    const resolvedSlug = doc ? resolveDocSlug(doc, page.slug) : page.slug;
    languages[loc] = buildCanonicalUrl(loc, resolvedSlug);
  }

  languages['x-default'] =
    languages[defaultLocale] || buildCanonicalUrl(defaultLocale, page.slug);
  return languages;
}
