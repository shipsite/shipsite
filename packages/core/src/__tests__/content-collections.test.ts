import { describe, it, expect } from 'vitest';
import { resolveKind, extractExcerpt } from '../content-collections';

// ─── resolveKind ───────────────────────────────────────────────

describe('resolveKind', () => {
  it('returns "page" for top-level directories', () => {
    expect(resolveKind('pricing')).toBe('page');
    expect(resolveKind('landing')).toBe('page');
    expect(resolveKind('features')).toBe('page');
  });

  it('returns "page" for non-blog nested directories', () => {
    expect(resolveKind('legal/privacy')).toBe('page');
  });

  it('returns "blog-article" for blog subdirectories', () => {
    expect(resolveKind('blog/my-first-post')).toBe('blog-article');
    expect(resolveKind('blog/getting-started')).toBe('blog-article');
  });

  it('returns "blog-article" for deeply nested blog paths', () => {
    expect(resolveKind('blog/2024/my-post')).toBe('blog-article');
  });

  it('handles "blog" alone — this is the blog index, not an article', () => {
    // "blog" has only 1 part when split by '/', so length <= 1
    // But "blog".startsWith('blog/') is false, so it falls through to 'page'
    // This is correct: the blog index is registered with content "blog" (no trailing slash)
    expect(resolveKind('blog')).toBe('page');
  });
});

// ─── extractExcerpt ────────────────────────────────────────────

describe('extractExcerpt', () => {
  it('returns empty string when no BlogIntro present', () => {
    expect(extractExcerpt('## Hello World\n\nSome content.')).toBe('');
  });

  it('extracts plain text from BlogIntro', () => {
    const mdx = '<BlogIntro>This is the intro paragraph.</BlogIntro>';
    expect(extractExcerpt(mdx)).toBe('This is the intro paragraph.');
  });

  it('strips bold markdown', () => {
    const mdx = '<BlogIntro>This is **very important** text.</BlogIntro>';
    expect(extractExcerpt(mdx)).toBe('This is very important text.');
  });

  it('strips markdown links', () => {
    const mdx = '<BlogIntro>Check out [our tool](https://example.com) today.</BlogIntro>';
    expect(extractExcerpt(mdx)).toBe('Check out our tool today.');
  });

  it('strips remaining markdown characters', () => {
    const mdx = '<BlogIntro>Use `code` and *italic* and _underline_ and ~strikethrough~.</BlogIntro>';
    expect(extractExcerpt(mdx)).toBe('Use code and italic and underline and strikethrough.');
  });

  it('collapses newlines into spaces', () => {
    const mdx = `<BlogIntro>First line.\n\nSecond line.\nThird line.</BlogIntro>`;
    expect(extractExcerpt(mdx)).toBe('First line. Second line. Third line.');
  });

  it('trims whitespace around content', () => {
    const mdx = `<BlogIntro>
  Some intro text with leading whitespace.
</BlogIntro>`;
    expect(extractExcerpt(mdx)).toBe('Some intro text with leading whitespace.');
  });

  it('handles BlogIntro with surrounding content', () => {
    const mdx = `---
title: Test
---

<BlogArticle>
<BlogIntro>The actual intro.</BlogIntro>

## Heading

More content.
</BlogArticle>`;
    expect(extractExcerpt(mdx)).toBe('The actual intro.');
  });

  it('handles complex real-world excerpt', () => {
    const mdx = `<BlogIntro>
**absentify** hilft [Unternehmen](https://example.com) bei der
Abwesenheitsplanung. Jetzt *kostenlos* testen!
</BlogIntro>`;
    expect(extractExcerpt(mdx)).toBe(
      'absentify hilft Unternehmen bei der Abwesenheitsplanung. Jetzt kostenlos testen!',
    );
  });
});
