import { join } from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';

// ── Public types ───────────────────────────────────────────────

export type A11yRule = 'alt-text' | 'heading-hierarchy' | 'link-text';

export interface A11yIssue {
  page: string;
  rule: A11yRule;
  message: string;
  line?: number;
}

export interface A11yResult {
  issues: A11yIssue[];
  score: number;
}

// ── Helpers ────────────────────────────────────────────────────

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

const BAD_LINK_TEXTS = new Set([
  'click here',
  'read more',
  'learn more',
  'here',
  'link',
  'more',
  'this',
]);

// ── Core a11y validation ───────────────────────────────────────

export function validateA11y(contentDir: string): A11yResult {
  const issues: A11yIssue[] = [];

  if (!existsSync(contentDir)) {
    return { issues, score: 100 };
  }

  const mdxFiles = collectMdxFiles(contentDir);

  for (const filePath of mdxFiles) {
    const source = readFileSync(filePath, 'utf-8');
    const rel = filePath.replace(contentDir + '/', '');
    const page = `content/${rel}`;
    const lines = source.split('\n');

    // ── Alt-text checks ──────────────────────────────────────

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Markdown images with empty alt text: ![](path)
      if (/!\[\]\(/.test(line)) {
        issues.push({
          page,
          rule: 'alt-text',
          message: 'Image missing alt text',
          line: i + 1,
        });
      }

      // HTML <img> without alt attribute
      if (/<img\b/i.test(line) && !/alt=/i.test(line)) {
        issues.push({
          page,
          rule: 'alt-text',
          message: '<img> tag missing alt attribute',
          line: i + 1,
        });
      }

    }

    // ── Heading hierarchy checks ─────────────────────────────

    const headings: { level: number; line: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const headingMatch = lines[i].match(/^(#{1,6})\s/);
      if (headingMatch) {
        headings.push({ level: headingMatch[1].length, line: i + 1 });
      }
    }

    // Check for skipped heading levels (e.g., ## -> #### without ###)
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1].level;
      const curr = headings[i].level;
      if (curr > prev + 1) {
        issues.push({
          page,
          rule: 'heading-hierarchy',
          message: `Heading level skipped: h${prev} → h${curr} (missing h${prev + 1})`,
          line: headings[i].line,
        });
      }
    }

    // Check for multiple H1s
    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length > 1) {
      for (const h1 of h1s.slice(1)) {
        issues.push({
          page,
          rule: 'heading-hierarchy',
          message: 'Multiple h1 headings (only one per page recommended)',
          line: h1.line,
        });
      }
    }

    // ── Link text quality checks ─────────────────────────────

    // Markdown links: [text](url)
    const linkRe = /\[([^\]]+)\]\([^)]+\)/g;
    for (let i = 0; i < lines.length; i++) {
      linkRe.lastIndex = 0;
      let linkMatch;
      while ((linkMatch = linkRe.exec(lines[i])) !== null) {
        const text = linkMatch[1].trim().toLowerCase();
        if (BAD_LINK_TEXTS.has(text)) {
          issues.push({
            page,
            rule: 'link-text',
            message: `Non-descriptive link text "${linkMatch[1].trim()}"`,
            line: i + 1,
          });
        }
      }
    }
  }

  // Score: start at 100, deduct 5 per issue, minimum 0
  const score = Math.max(0, 100 - issues.length * 5);

  return { issues, score };
}
