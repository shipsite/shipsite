import { join } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';

function isExternal(href: string): boolean {
  return /^(https?:\/\/|mailto:|tel:|#)/.test(href);
}

function collectMdxFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || entry.startsWith('_')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectMdxFiles(full));
    } else if (entry.endsWith('.mdx')) {
      files.push(full);
    }
  }
  return files;
}

export function validateLinks(
  config: {
    pages?: Array<{ slug: string }>;
    navigation?: { items?: Array<{ href: string }>; cta?: { href: string } };
    footer?: { columns?: Array<{ links?: Array<{ href: string }> }> };
  },
  contentDir: string,
  fail: (msg: string) => void,
  _warn: (msg: string) => void,
): void {
  // Step 1 — Build slug set
  const slugs = new Set<string>();
  for (const page of config.pages || []) {
    slugs.add('/' + page.slug);
  }

  function checkHref(href: string, context: string) {
    if (isExternal(href)) return;
    if (!href.startsWith('/')) return; // relative or anchor-only — skip
    // Strip trailing slash for comparison (but keep "/" as-is)
    const normalized = href.length > 1 ? href.replace(/\/$/, '') : href;
    if (!slugs.has(normalized)) {
      fail(`Dead link "${href}" in ${context}`);
    }
  }

  // Step 2 — Navigation
  for (const item of config.navigation?.items || []) {
    checkHref(item.href, 'navigation');
  }
  if (config.navigation?.cta) {
    checkHref(config.navigation.cta.href, 'navigation CTA');
  }

  // Step 3 — Footer
  for (const column of config.footer?.columns || []) {
    for (const link of column.links || []) {
      checkHref(link.href, 'footer');
    }
  }

  // Step 4 — MDX content
  if (!existsSync(contentDir)) return;

  const mdxFiles = collectMdxFiles(contentDir);
  const markdownLinkRe = /\[(?:[^\]]*)\]\(([^)]+)\)/g;
  const jsxHrefRe = /href=["']([^"']+)["']/g;

  for (const filePath of mdxFiles) {
    const source = readFileSync(filePath, 'utf-8');
    const rel = filePath.replace(contentDir + '/', '');

    let match: RegExpExecArray | null;

    markdownLinkRe.lastIndex = 0;
    while ((match = markdownLinkRe.exec(source)) !== null) {
      checkHref(match[1], `content/${rel}`);
    }

    jsxHrefRe.lastIndex = 0;
    while ((match = jsxHrefRe.exec(source)) !== null) {
      checkHref(match[1], `content/${rel}`);
    }
  }
}
