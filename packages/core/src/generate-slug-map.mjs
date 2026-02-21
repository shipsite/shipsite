#!/usr/bin/env node
/**
 * Generate slug-map.json for middleware slug remapping.
 * Maps EN slugs → localized slugs for each non-default locale.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export function generateSlugMap(rootDir) {
  const configPath = join(rootDir, 'shipsite.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const defaultLocale = config.i18n?.defaultLocale || 'en';
  const pages = config.pages || [];

  function extractSlug(mdxPath) {
    if (!existsSync(mdxPath)) return undefined;
    const content = readFileSync(mdxPath, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return undefined;
    const fm = fmMatch[1];
    const slugMatch =
      fm.match(/^slug:\s*"(.*)"\s*$/m) || fm.match(/^slug:\s*'(.*)'\s*$/m);
    return slugMatch ? slugMatch[1] : undefined;
  }

  function resolveDocSlug(slug, contentFolder, fallbackSlug) {
    if (!slug) return fallbackSlug;
    if (slug.includes('/')) return slug;
    const folderParts = contentFolder.split('/');
    const prefix =
      folderParts.length > 1 ? folderParts.slice(0, -1).join('/') + '/' : '';
    return prefix + slug;
  }

  const slugMap = {};

  for (const page of pages) {
    const pageLocales = page.locales || [defaultLocale];
    const enSlug = page.slug;
    const localizedSlugs = {};

    for (const locale of pageLocales) {
      if (locale === defaultLocale) continue;

      const mdxPath = join(rootDir, 'content', page.content, `${locale}.mdx`);
      const frontmatterSlug = extractSlug(mdxPath);
      const resolvedSlug = resolveDocSlug(
        frontmatterSlug,
        page.content,
        enSlug,
      );

      if (resolvedSlug !== enSlug) {
        localizedSlugs[locale] = resolvedSlug;
      }
    }

    if (Object.keys(localizedSlugs).length > 0) {
      slugMap[enSlug] = localizedSlugs;
    }
  }

  return slugMap;
}

// CLI usage
const __filename = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  (process.argv[1] === __filename ||
    process.argv[1].endsWith('generate-slug-map.mjs'))
) {
  const rootDir = process.argv[2] || process.cwd();
  const slugMap = generateSlugMap(rootDir);
  const outputPath = join(rootDir, '.shipsite', 'slug-map.json');
  writeFileSync(outputPath, JSON.stringify(slugMap, null, 2) + '\n');
  console.log(
    `Generated slug-map.json with ${Object.keys(slugMap).length} entries`,
  );
}
