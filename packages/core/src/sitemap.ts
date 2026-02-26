import type { MetadataRoute } from 'next';
import { allSitePages } from 'content-collections';
import { getAllPages, buildCanonicalUrl, isExcludedFromIndex } from './pages';
import { getDefaultLocale } from './config';

const priorityMap: Record<string, number> = {
  landing: 1.0,
  product: 0.9,
  'blog-index': 0.8,
  'blog-article': 0.7,
  'feature-detail': 0.8,
  comparison: 0.8,
  page: 0.6,
  legal: 0.3,
};

const changefreqMap: Record<
  string,
  MetadataRoute.Sitemap[number]['changeFrequency']
> = {
  landing: 'weekly',
  product: 'weekly',
  'blog-index': 'daily',
  'blog-article': 'monthly',
  'feature-detail': 'monthly',
  comparison: 'monthly',
  page: 'monthly',
  legal: 'yearly',
};

function resolveSlug(
  page: { slug: string; content: string },
  locale: string,
): string {
  const doc = allSitePages.find(
    (d) => d.contentFolder === page.content && d.locale === locale,
  );
  if (doc?.slug) {
    if (doc.slug.includes('/')) return doc.slug;
    const folderParts = doc.contentFolder.split('/');
    const prefix =
      folderParts.length > 1 ? folderParts.slice(0, -1).join('/') + '/' : '';
    return prefix + doc.slug;
  }
  return page.slug;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const allPages = getAllPages();
  const defaultLocale = getDefaultLocale();
  const entries: MetadataRoute.Sitemap = [];

  for (const page of allPages) {
    if (isExcludedFromIndex(page)) continue;

    const pageLocales = page.locales || [defaultLocale];

    let lastModified: string | undefined;
    const contentDoc = allSitePages.find(
      (doc) =>
        doc.contentFolder === page.content && doc.locale === defaultLocale,
    );
    if (contentDoc?.date) {
      lastModified = contentDoc.date;
    }

    const languages: Record<string, string> = {};
    for (const locale of pageLocales) {
      languages[locale] = buildCanonicalUrl(locale, resolveSlug(page, locale));
    }
    languages['x-default'] = buildCanonicalUrl(
      defaultLocale,
      resolveSlug(page, defaultLocale),
    );

    for (const locale of pageLocales) {
      entries.push({
        url: buildCanonicalUrl(locale, resolveSlug(page, locale)),
        ...(lastModified && { lastModified }),
        changeFrequency: changefreqMap[page.type] ?? 'monthly',
        priority: priorityMap[page.type] ?? 0.5,
        alternates: { languages },
      });
    }
  }

  return entries;
}
