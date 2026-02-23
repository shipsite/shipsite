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
  it('returns empty string when neither excerpt nor description provided', () => {
    expect(extractExcerpt(undefined, undefined)).toBe('');
  });

  it('returns description when no excerpt provided', () => {
    expect(extractExcerpt(undefined, 'Meta description.')).toBe('Meta description.');
  });

  it('returns excerpt when provided, ignoring description', () => {
    expect(extractExcerpt('Longer intro text for listings.', 'Short meta.')).toBe('Longer intro text for listings.');
  });

  it('falls back to description when excerpt is empty string', () => {
    expect(extractExcerpt('', 'Fallback description.')).toBe('Fallback description.');
  });

  it('trims whitespace', () => {
    expect(extractExcerpt('  Some excerpt.  ', undefined)).toBe('Some excerpt.');
  });
});
