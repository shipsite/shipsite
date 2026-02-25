import { join, relative } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { validateLinks } from './validate-links.js';

// ── Public types ───────────────────────────────────────────────

export interface SeoIssue {
  page: string;
  message: string;
}

export interface PageSeoStatus {
  slug: string;
  title: string;
  description: string;
  titleLength: number;
  descriptionLength: number;
}

export interface SeoValidationResult {
  score: number;
  errors: SeoIssue[];
  warnings: SeoIssue[];
  pages: PageSeoStatus[];
}

// ── Internal helpers ───────────────────────────────────────────

function parseFrontmatter(source: string): Record<string, string> | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return null;
  const raw = match[1];
  const data: Record<string, string> = {};

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) {
      data[key] = value;
    }
  }

  return data;
}

function extractComponentProps(
  source: string,
  componentName: string,
): Set<string> | null {
  const match = source.match(
    new RegExp(`<${componentName}\\b([\\s\\S]*?)>`),
  );
  if (!match) return null;
  const raw = match[1] || '';
  const props = new Set<string>();
  const propRegex = /([A-Za-z][A-Za-z0-9_]*)\s*=/g;
  let propMatch;
  while ((propMatch = propRegex.exec(raw))) {
    props.add(propMatch[1]);
  }
  return props;
}

// ── Core validation logic ──────────────────────────────────────

export function runValidation(rootDir?: string): SeoValidationResult {
  const dir = rootDir || process.cwd();
  const configPath = join(dir, 'shipsite.json');
  const contentDir = join(dir, 'content');

  const errors: SeoIssue[] = [];
  const warnings: SeoIssue[] = [];
  const pageStatuses: PageSeoStatus[] = [];

  function fail(page: string, message: string) {
    errors.push({ page, message });
  }

  function warn(page: string, message: string) {
    warnings.push({ page, message });
  }

  // Legacy wrappers for validateLinks compatibility
  function failLegacy(message: string) {
    // Parse "context: message" or use as-is
    const colonIdx = message.lastIndexOf(' in ');
    if (colonIdx !== -1) {
      const ctx = message.slice(colonIdx + 4);
      const msg = message.slice(0, colonIdx);
      errors.push({ page: ctx, message: msg });
    } else {
      errors.push({ page: '', message });
    }
  }

  function warnLegacy(message: string) {
    const colonIdx = message.lastIndexOf(' in ');
    if (colonIdx !== -1) {
      const ctx = message.slice(colonIdx + 4);
      const msg = message.slice(0, colonIdx);
      warnings.push({ page: ctx, message: msg });
    } else {
      warnings.push({ page: '', message });
    }
  }

  if (!existsSync(configPath)) {
    fail('shipsite.json', 'shipsite.json not found in current directory');
    return buildResult(errors, warnings, pageStatuses);
  }

  if (!existsSync(contentDir)) {
    fail('content/', 'content/ directory not found');
    return buildResult(errors, warnings, pageStatuses);
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const pages: Array<{
    slug: string;
    type: string;
    content: string;
    locales?: string[];
  }> = config.pages || [];
  const blogAuthors = Object.keys(config.blog?.authors || {});
  const contentSet = new Set(pages.map((page) => page.content));

  const titlesByLocale = new Map<string, Map<string, string[]>>();
  const descriptionsByLocale = new Map<string, Map<string, string[]>>();

  for (const page of pages) {
    if (!page.content) {
      fail(page.slug, `Page is missing "content" path`);
      continue;
    }

    const pageDir = join(contentDir, page.content);
    if (!existsSync(pageDir)) {
      fail(`content/${page.content}`, 'Missing content folder');
      continue;
    }

    const pageLocales = page.locales || [config.i18n?.defaultLocale || 'en'];
    for (const locale of pageLocales) {
      const mdxPath = join(pageDir, `${locale}.mdx`);
      if (!existsSync(mdxPath)) {
        fail(`content/${page.content}/${locale}.mdx`, 'Missing MDX file');
        continue;
      }

      const source = readFileSync(mdxPath, 'utf-8');
      const rel = relative(contentDir, mdxPath);
      const filePath = `content/${rel}`;
      const frontmatter = parseFrontmatter(source);

      if (!frontmatter) {
        fail(filePath, 'Missing frontmatter');
        continue;
      }
      if (!frontmatter.title) {
        fail(filePath, 'Missing "title" in frontmatter');
      }
      if (!frontmatter.description) {
        fail(filePath, 'Missing "description" in frontmatter');
      }

      // SEO checks
      const title = frontmatter.title || '';
      const description = frontmatter.description || '';
      const titleLength = title.trim().length;
      const descriptionLength = description.trim().length;

      pageStatuses.push({
        slug: page.slug,
        title,
        description,
        titleLength,
        descriptionLength,
      });

      if (titleLength > 0 && (titleLength < 30 || titleLength > 70)) {
        warn(filePath, `SEO title length (${titleLength}) out of range 30-70`);
      }
      if (descriptionLength > 0 && (descriptionLength < 70 || descriptionLength > 160)) {
        warn(filePath, `SEO description length (${descriptionLength}) out of range 70-160`);
      }
      if (description.endsWith('...')) {
        warn(filePath, 'SEO description ends with ellipsis');
      }
      if (title.toLowerCase() === description.toLowerCase() && title.length > 0) {
        warn(filePath, 'SEO title equals description');
      }
      if (
        description.toLowerCase().trim().startsWith(title.toLowerCase().trim()) &&
        title.trim().length > 0
      ) {
        warn(filePath, 'SEO description starts with title');
      }
      if (descriptionLength > 0 && !/[.!?]$/.test(description.trim())) {
        warn(filePath, 'SEO description should end with punctuation');
      }

      // Keyword stuffing
      const stopwords = new Set([
        'the', 'and', 'or', 'for', 'with', 'from', 'that', 'this',
        'your', 'you', 'are', 'our', 'to', 'of', 'in', 'a', 'an',
      ]);
      const tokens = description.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const counts = new Map<string, number>();
      for (const token of tokens) {
        if (token.length < 3 || stopwords.has(token)) continue;
        counts.set(token, (counts.get(token) || 0) + 1);
      }
      for (const [token, count] of counts.entries()) {
        if (count >= 4) {
          warn(filePath, `SEO description repeats "${token}" ${count}x`);
          break;
        }
      }

      // Collect for duplicate detection
      if (frontmatter.title) {
        if (!titlesByLocale.has(locale)) titlesByLocale.set(locale, new Map());
        const titles = titlesByLocale.get(locale)!;
        const key = frontmatter.title.trim();
        if (!titles.has(key)) titles.set(key, []);
        titles.get(key)!.push(filePath);
      }
      if (frontmatter.description) {
        if (!descriptionsByLocale.has(locale)) descriptionsByLocale.set(locale, new Map());
        const descriptions = descriptionsByLocale.get(locale)!;
        const key = frontmatter.description.trim();
        if (!descriptions.has(key)) descriptions.set(key, []);
        descriptions.get(key)!.push(filePath);
      }

      // Blog slug prefix check
      const parts = page.content.split('/');
      if (parts[0] === 'blog' && frontmatter.slug && frontmatter.slug.startsWith('blog/')) {
        fail(filePath, `Blog slug "${frontmatter.slug}" must not start with "blog/"`);
      }

      // Raw <img> tags
      if (/<img\b(?![^>]*\bsrc\s*=\s*["']https?:\/\/)/i.test(source)) {
        fail(filePath, 'Raw <img> tag found — use MDX components');
      }

      // Curly quotes in JSX props
      const curlyQuoteRe = /[\u201C\u201D\u2018\u2019]/;
      const jsxAttrRe = /\w+=\s*["'\u201C\u201D\u2018\u2019]/;
      const lines = source.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (jsxAttrRe.test(line) && curlyQuoteRe.test(line)) {
          fail(filePath, `Curly quote in JSX prop — use straight quotes (line ${i + 1})`);
        }
      }

      // Component checks per page type
      if (page.type === 'landing') {
        const props = extractComponentProps(source, 'Hero');
        if (!props) {
          fail(filePath, 'Missing <Hero> component');
        } else {
          for (const prop of ['title', 'description']) {
            if (!props.has(prop)) fail(filePath, `Missing prop "${prop}" in <Hero>`);
          }
        }
      }

      if (page.type === 'blog-index') {
        const props = extractComponentProps(source, 'BlogIndex');
        if (!props) {
          fail(filePath, 'Missing <BlogIndex> component');
        } else {
          for (const prop of ['title', 'description']) {
            if (!props.has(prop)) fail(filePath, `Missing prop "${prop}" in <BlogIndex>`);
          }
        }
      }

      if (page.type === 'blog-article') {
        if (!extractComponentProps(source, 'BlogArticle')) {
          fail(filePath, 'Missing <BlogArticle> component');
        }

        for (const field of ['date', 'author', 'readingTime']) {
          if (!frontmatter[field]) {
            fail(filePath, `Missing frontmatter "${field}" for blog article`);
          }
        }
        if (!frontmatter.image) {
          warn(filePath, 'Missing frontmatter "image" for blog article (fallback will be used)');
        }
        if (frontmatter.author && !blogAuthors.includes(frontmatter.author)) {
          fail(filePath, `Unknown author "${frontmatter.author}" (not in shipsite.json blog.authors)`);
        }
        if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
          fail(filePath, `Invalid date format "${frontmatter.date}" (expected YYYY-MM-DD)`);
        }
        if (frontmatter.readingTime && isNaN(Number(frontmatter.readingTime))) {
          fail(filePath, 'readingTime must be a number');
        }
        if (frontmatter.image) {
          const imagePath = join(dir, 'public', frontmatter.image);
          if (!existsSync(imagePath)) {
            warn(filePath, `Blog image not found: public${frontmatter.image}`);
          }
        }

        // Minimum word count
        const bodyContent = source
          .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '')
          .replace(/<[^>]+>/g, '')
          .replace(/import\s+.*?from\s+['"][^'"]+['"]\s*;?/g, '')
          .trim();
        const wordCount = bodyContent.split(/\s+/).filter(Boolean).length;
        if (wordCount < 300) {
          warn(filePath, `Blog article has only ${wordCount} words (minimum 300)`);
        }

        // Heading structure
        const headingLines = source.split('\n').filter((l) => /^#{2,6}\s/.test(l));
        const hasH2 = headingLines.some((l) => /^##\s/.test(l));
        if (!hasH2) {
          warn(filePath, 'Blog article has no ## headings');
        }
        const firstH2Index = headingLines.findIndex((l) => /^##\s/.test(l));
        const firstH3Index = headingLines.findIndex((l) => /^###\s/.test(l));
        if (firstH3Index !== -1 && (firstH2Index === -1 || firstH3Index < firstH2Index)) {
          warn(filePath, 'Blog article has ### before first ##');
        }
      }

      // BannerCTA check (any page type)
      const bannerProps = extractComponentProps(source, 'BannerCTA');
      if (bannerProps) {
        for (const prop of ['title', 'buttonText']) {
          if (!bannerProps.has(prop)) fail(filePath, `Missing prop "${prop}" in <BannerCTA>`);
        }
      }
    }
  }

  // Cross-page duplicate detection
  for (const [locale, titles] of titlesByLocale.entries()) {
    for (const [title, files] of titles.entries()) {
      if (files.length > 1) {
        warn(files[0], `Duplicate title "${title}" in locale "${locale}": ${files.join(', ')}`);
      }
    }
  }
  for (const [locale, descriptions] of descriptionsByLocale.entries()) {
    for (const [, files] of descriptions.entries()) {
      if (files.length > 1) {
        warn(files[0], `Duplicate description in locale "${locale}": ${files.join(', ')}`);
      }
    }
  }

  // Orphan content detection
  function walkContentDirs(walkDir: string, prefix: string) {
    for (const entry of readdirSync(walkDir)) {
      if (entry.startsWith('_') || entry.startsWith('.')) continue;
      const entryPath = join(walkDir, entry);
      if (!statSync(entryPath).isDirectory()) continue;
      const contentPath = prefix ? `${prefix}/${entry}` : entry;
      const hasMdx = readdirSync(entryPath).some((f) => f.endsWith('.mdx'));
      if (hasMdx && !contentSet.has(contentPath)) {
        warn(`content/${contentPath}`, 'Content folder not referenced in shipsite.json pages');
      }
      walkContentDirs(entryPath, contentPath);
    }
  }
  walkContentDirs(contentDir, '');

  // Link validation
  validateLinks(config, contentDir, failLegacy, warnLegacy);

  return buildResult(errors, warnings, pageStatuses);
}

function buildResult(
  errors: SeoIssue[],
  warnings: SeoIssue[],
  pages: PageSeoStatus[],
): SeoValidationResult {
  const score = Math.max(0, 100 - errors.length * 10 - warnings.length * 2);
  return { score, errors, warnings, pages };
}

// ── CLI entry point ────────────────────────────────────────────

export async function validate() {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes('--json');

  const result = runValidation();

  if (jsonFlag) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    if (result.errors.length > 0) process.exit(1);
    return;
  }

  // Pretty console output (default)
  console.log('\n  Validating content...\n');

  if (result.warnings.length) {
    console.warn('  Warnings:');
    for (const w of result.warnings) {
      console.warn(`    - ${w.message}${w.page ? `: ${w.page}` : ''}`);
    }
    console.log();
  }

  if (result.errors.length) {
    console.error('  Errors:');
    for (const e of result.errors) {
      console.error(`    - ${e.message}${e.page ? `: ${e.page}` : ''}`);
    }
    console.log();
    console.error(
      `  Validation failed: ${result.errors.length} error(s), ${result.warnings.length} warning(s) — Score: ${result.score}/100`,
    );
    process.exit(1);
  }

  console.log(
    `  Validation passed. (${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}) — Score: ${result.score}/100`,
  );
}
