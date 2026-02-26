import { allSitePages } from 'content-collections';
import { getAllPages, buildCanonicalUrl, isHiddenPage } from './pages';
import { getConfig, getDefaultLocale } from './config';

/**
 * Generate /llms.txt content — a concise index of all pages with title and description.
 * See https://llmstxt.org for the specification.
 */
export function generateLlmsTxt(): string {
  const config = getConfig();
  const defaultLocale = getDefaultLocale();
  const pages = getAllPages();
  const lines: string[] = [];

  // Header
  lines.push(`# ${config.name}`);
  lines.push('');

  // Site description from landing page
  const landingDoc = allSitePages.find(
    (d) => d.contentFolder === (pages.find((p) => p.slug === '')?.content || 'landing') && d.locale === defaultLocale,
  );
  if (landingDoc?.description) {
    lines.push(`> ${landingDoc.description}`);
    lines.push('');
  }

  // Page index (exclude hidden/draft pages)
  for (const page of pages) {
    if (isHiddenPage(page)) continue;
    const doc = allSitePages.find(
      (d) => d.contentFolder === page.content && d.locale === defaultLocale,
    );
    const title = doc?.title || page.content;
    const description = doc?.description || '';
    const url = buildCanonicalUrl(defaultLocale, page.slug);

    if (description) {
      lines.push(`- [${title}](${url}): ${description}`);
    } else {
      lines.push(`- [${title}](${url})`);
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * Generate /llms-full.txt — full text content of all pages, cleaned of JSX/imports.
 */
export function generateLlmsFullTxt(): string {
  const config = getConfig();
  const defaultLocale = getDefaultLocale();
  const pages = getAllPages();
  const sections: string[] = [];

  // Header
  sections.push(`# ${config.name}\n`);

  for (const page of pages) {
    if (isHiddenPage(page)) continue;

    const doc = allSitePages.find(
      (d) => d.contentFolder === page.content && d.locale === defaultLocale,
    );
    if (!doc) continue;

    const title = doc.title || page.content;
    const url = buildCanonicalUrl(defaultLocale, page.slug);
    const rawContent = doc.body?.raw || '';

    // Clean MDX content: remove JSX tags, imports, frontmatter
    const cleanContent = rawContent
      .replace(/^---[\s\S]*?---\n?/, '')                          // Frontmatter
      .replace(/^import\s+.*$/gm, '')                             // Import statements
      .replace(/<[A-Z][a-zA-Z]*\s*[^>]*\/>/g, '')                // Self-closing JSX
      .replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '') // JSX blocks
      .replace(/<[a-z][^>]*>/g, '')                                // Opening HTML tags
      .replace(/<\/[a-z][^>]*>/g, '')                              // Closing HTML tags
      .replace(/\n{3,}/g, '\n\n')                                  // Collapse blank lines
      .trim();

    if (cleanContent) {
      sections.push(`## ${title}\n\nSource: ${url}\n\n${cleanContent}`);
    }
  }

  return sections.join('\n\n---\n\n') + '\n';
}
