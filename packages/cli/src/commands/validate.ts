import { join, relative } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { validateLinks } from './validate-links.js';

const errors: string[] = [];
const warnings: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function warn(message: string) {
  warnings.push(message);
}

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

function requireComponent(
  source: string,
  componentName: string,
  filePath: string,
): Set<string> | null {
  const props = extractComponentProps(source, componentName);
  if (!props) {
    fail(`Missing <${componentName}> in: ${filePath}`);
    return null;
  }
  return props;
}

function requireProps(
  props: Set<string>,
  required: string[],
  componentName: string,
  filePath: string,
) {
  for (const prop of required) {
    if (!props.has(prop)) {
      fail(`Missing prop "${prop}" in <${componentName}>: ${filePath}`);
    }
  }
}

function warnOnSeo(
  frontmatter: Record<string, string>,
  filePath: string,
) {
  const title = frontmatter.title || '';
  const description = frontmatter.description || '';
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;

  if (titleLength < 30 || titleLength > 70) {
    warn(
      `SEO title length (${titleLength}) out of range 30-70: ${filePath}`,
    );
  }
  if (descriptionLength < 70 || descriptionLength > 160) {
    warn(
      `SEO description length (${descriptionLength}) out of range 70-160: ${filePath}`,
    );
  }
  if (description.endsWith('...')) {
    warn(`SEO description ends with ellipsis: ${filePath}`);
  }
  if (title.toLowerCase() === description.toLowerCase()) {
    warn(`SEO title equals description: ${filePath}`);
  }

  const descriptionLower = description.toLowerCase().trim();
  const titleLower = title.toLowerCase().trim();
  if (descriptionLower.startsWith(titleLower) && titleLower.length > 0) {
    warn(`SEO description starts with title: ${filePath}`);
  }

  const punctuation = /[.!?]$/;
  if (descriptionLength > 0 && !punctuation.test(description.trim())) {
    warn(`SEO description should end with punctuation: ${filePath}`);
  }

  const stopwords = new Set([
    'the', 'and', 'or', 'for', 'with', 'from', 'that', 'this',
    'your', 'you', 'are', 'our', 'to', 'of', 'in', 'a', 'an',
  ]);
  const tokens = descriptionLower.split(/[^a-z0-9]+/).filter(Boolean);
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (token.length < 3 || stopwords.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  for (const [token, count] of counts.entries()) {
    if (count >= 4) {
      warn(
        `SEO description repeats "${token}" ${count}x: ${filePath}`,
      );
      break;
    }
  }
}

export async function validate() {
  const rootDir = process.cwd();
  const configPath = join(rootDir, 'shipsite.json');
  const contentDir = join(rootDir, 'content');

  console.log('\n  Validating content...\n');

  if (!existsSync(configPath)) {
    console.error('  Error: shipsite.json not found in current directory');
    process.exit(1);
  }

  if (!existsSync(contentDir)) {
    console.error('  Error: content/ directory not found');
    process.exit(1);
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

  // Track titles/descriptions per locale for duplicate detection
  const titlesByLocale = new Map<string, Map<string, string[]>>();
  const descriptionsByLocale = new Map<string, Map<string, string[]>>();

  for (const page of pages) {
    if (!page.content) {
      fail(`Page is missing "content" path for slug "${page.slug}"`);
      continue;
    }

    const pageDir = join(contentDir, page.content);
    if (!existsSync(pageDir)) {
      fail(`Missing content folder: content/${page.content}`);
      continue;
    }

    const pageLocales = page.locales || [config.i18n?.defaultLocale || 'en'];
    for (const locale of pageLocales) {
      const mdxPath = join(pageDir, `${locale}.mdx`);
      if (!existsSync(mdxPath)) {
        fail(`Missing MDX file: content/${page.content}/${locale}.mdx`);
        continue;
      }

      const source = readFileSync(mdxPath, 'utf-8');
      const rel = relative(contentDir, mdxPath);
      const frontmatter = parseFrontmatter(source);

      if (!frontmatter) {
        fail(`Missing frontmatter in: content/${rel}`);
        continue;
      }
      if (!frontmatter.title) {
        fail(`Missing "title" in frontmatter: content/${rel}`);
      }
      if (!frontmatter.description) {
        fail(`Missing "description" in frontmatter: content/${rel}`);
      }

      warnOnSeo(frontmatter, `content/${rel}`);

      // Collect titles/descriptions for duplicate detection
      if (frontmatter.title) {
        if (!titlesByLocale.has(locale))
          titlesByLocale.set(locale, new Map());
        const titles = titlesByLocale.get(locale)!;
        const key = frontmatter.title.trim();
        if (!titles.has(key)) titles.set(key, []);
        titles.get(key)!.push(`content/${rel}`);
      }
      if (frontmatter.description) {
        if (!descriptionsByLocale.has(locale))
          descriptionsByLocale.set(locale, new Map());
        const descriptions = descriptionsByLocale.get(locale)!;
        const key = frontmatter.description.trim();
        if (!descriptions.has(key)) descriptions.set(key, []);
        descriptions.get(key)!.push(`content/${rel}`);
      }

      // Blog slugs must not contain "blog/" prefix
      const parts = page.content.split('/');
      if (
        parts[0] === 'blog' &&
        frontmatter.slug &&
        frontmatter.slug.startsWith('blog/')
      ) {
        fail(
          `Blog slug "${frontmatter.slug}" must not start with "blog/": content/${rel}`,
        );
      }

      // Raw <img> tags
      if (/<img\b(?![^>]*\bsrc\s*=\s*["']https?:\/\/)/i.test(source)) {
        fail(`Raw <img> tag found — use MDX components: content/${rel}`);
      }

      // --- Component checks per page type ---

      if (page.type === 'landing') {
        const props = requireComponent(source, 'Hero', `content/${rel}`);
        if (props) {
          requireProps(
            props,
            ['title', 'description'],
            'Hero',
            `content/${rel}`,
          );
        }
      }

      if (page.type === 'blog-index') {
        const props = requireComponent(
          source,
          'BlogIndex',
          `content/${rel}`,
        );
        if (props) {
          requireProps(
            props,
            ['title', 'description'],
            'BlogIndex',
            `content/${rel}`,
          );
        }
      }

      if (page.type === 'blog-article') {
        requireComponent(source, 'BlogArticle', `content/${rel}`);

        // Required frontmatter fields
        const requiredBlogFields = ['date', 'author', 'readingTime'];
        for (const field of requiredBlogFields) {
          if (!frontmatter[field]) {
            fail(
              `Missing frontmatter "${field}" for blog article: content/${rel}`,
            );
          }
        }
        if (!frontmatter.image) {
          warn(
            `Missing frontmatter "image" for blog article (fallback will be used): content/${rel}`,
          );
        }

        // Validate author exists in shipsite.json
        if (frontmatter.author && !blogAuthors.includes(frontmatter.author)) {
          fail(
            `Unknown author "${frontmatter.author}" (not in shipsite.json blog.authors): content/${rel}`,
          );
        }

        // Validate date format YYYY-MM-DD
        if (
          frontmatter.date &&
          !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)
        ) {
          fail(
            `Invalid date format "${frontmatter.date}" (expected YYYY-MM-DD): content/${rel}`,
          );
        }

        // Validate readingTime is a number
        if (frontmatter.readingTime && isNaN(Number(frontmatter.readingTime))) {
          fail(`readingTime must be a number: content/${rel}`);
        }

        // Validate image file exists
        if (frontmatter.image) {
          const imagePath = join(rootDir, 'public', frontmatter.image);
          if (!existsSync(imagePath)) {
            warn(
              `Blog image not found: public${frontmatter.image} (referenced in content/${rel})`,
            );
          }
        }

        // Minimum word count (300 words)
        const bodyContent = source
          .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '')
          .replace(/<[^>]+>/g, '')
          .replace(/import\s+.*?from\s+['"][^'"]+['"]\s*;?/g, '')
          .trim();
        const wordCount = bodyContent.split(/\s+/).filter(Boolean).length;
        if (wordCount < 300) {
          warn(
            `Blog article has only ${wordCount} words (minimum 300): content/${rel}`,
          );
        }

        // Heading structure validation
        const headingLines = source
          .split('\n')
          .filter((l) => /^#{2,6}\s/.test(l));
        const hasH2 = headingLines.some((l) => /^##\s/.test(l));
        if (!hasH2) {
          warn(`Blog article has no ## headings: content/${rel}`);
        }
        const firstH2Index = headingLines.findIndex((l) => /^##\s/.test(l));
        const firstH3Index = headingLines.findIndex((l) =>
          /^###\s/.test(l),
        );
        if (
          firstH3Index !== -1 &&
          (firstH2Index === -1 || firstH3Index < firstH2Index)
        ) {
          warn(
            `Blog article has ### before first ##: content/${rel}`,
          );
        }
      }

      // Component-level checks by presence (any page type)
      const bannerProps = extractComponentProps(source, 'BannerCTA');
      if (bannerProps) {
        requireProps(
          bannerProps,
          ['title', 'buttonText'],
          'BannerCTA',
          `content/${rel}`,
        );
      }
    }
  }

  // Cross-page duplicate title/description detection
  for (const [locale, titles] of titlesByLocale.entries()) {
    for (const [title, files] of titles.entries()) {
      if (files.length > 1) {
        warn(
          `Duplicate title "${title}" in locale "${locale}": ${files.join(', ')}`,
        );
      }
    }
  }
  for (const [locale, descriptions] of descriptionsByLocale.entries()) {
    for (const [, files] of descriptions.entries()) {
      if (files.length > 1) {
        warn(
          `Duplicate description in locale "${locale}": ${files.join(', ')}`,
        );
      }
    }
  }

  // Warn about orphan content not in shipsite.json
  function walkContentDirs(dir: string, prefix: string) {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('_') || entry.startsWith('.')) continue;
      const entryPath = join(dir, entry);
      if (!statSync(entryPath).isDirectory()) continue;
      const contentPath = prefix ? `${prefix}/${entry}` : entry;
      const hasMdx = readdirSync(entryPath).some((f) => f.endsWith('.mdx'));
      if (hasMdx && !contentSet.has(contentPath)) {
        warn(
          `Content folder not referenced in shipsite.json pages: content/${contentPath}`,
        );
      }
      walkContentDirs(entryPath, contentPath);
    }
  }
  walkContentDirs(contentDir, '');

  // Link validation
  validateLinks(config, contentDir, fail, warn);

  // Output results
  if (warnings.length) {
    console.warn('  Warnings:');
    for (const message of warnings) {
      console.warn(`    - ${message}`);
    }
    console.log();
  }

  if (errors.length) {
    console.error('  Errors:');
    for (const message of errors) {
      console.error(`    - ${message}`);
    }
    console.log();
    console.error(
      `  Validation failed: ${errors.length} error(s), ${warnings.length} warning(s)`,
    );
    process.exit(1);
  }

  console.log(
    `  Validation passed. (${warnings.length} warning${warnings.length !== 1 ? 's' : ''})`,
  );
}
