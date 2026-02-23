import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock config module before importing pages
vi.mock('../config', () => ({
  getConfig: vi.fn(() => ({
    url: 'https://example.com',
    i18n: { defaultLocale: 'en', locales: ['en', 'de'], localePrefix: 'as-needed' },
    pages: [],
  })),
  getSiteUrl: vi.fn(() => 'https://example.com'),
  getDefaultLocale: vi.fn(() => 'en'),
}));

// Mock content-collections (unused for the functions we test)
vi.mock('content-collections', () => ({
  allSitePages: [],
}));

import { isNoIndexPage, buildCanonicalUrl } from '../pages';

// ─── isNoIndexPage ─────────────────────────────────────────────

describe('isNoIndexPage', () => {
  it('returns true for legal page type', () => {
    expect(isNoIndexPage({ slug: 'privacy', type: 'legal', content: 'privacy' })).toBe(true);
    expect(isNoIndexPage({ slug: 'terms', type: 'legal', content: 'terms' })).toBe(true);
  });

  it('returns true for thank-you slug', () => {
    expect(isNoIndexPage({ slug: 'thank-you', type: 'page', content: 'thank-you' })).toBe(true);
  });

  it('returns false for regular pages', () => {
    expect(isNoIndexPage({ slug: 'pricing', type: 'page', content: 'pricing' })).toBe(false);
    expect(isNoIndexPage({ slug: '', type: 'landing', content: 'landing' })).toBe(false);
    expect(isNoIndexPage({ slug: 'blog', type: 'blog-index', content: 'blog' })).toBe(false);
  });

  it('returns false for blog articles', () => {
    expect(isNoIndexPage({ slug: 'blog/my-post', type: 'blog-article', content: 'blog/my-post' })).toBe(false);
  });

  it('legal type takes precedence regardless of slug', () => {
    expect(isNoIndexPage({ slug: 'pricing', type: 'legal', content: 'pricing' })).toBe(true);
  });
});

// ─── buildCanonicalUrl ─────────────────────────────────────────

describe('buildCanonicalUrl', () => {
  it('builds URL for default locale without prefix', () => {
    expect(buildCanonicalUrl('en', 'pricing')).toBe('https://example.com/pricing');
  });

  it('builds URL for non-default locale with prefix', () => {
    expect(buildCanonicalUrl('de', 'pricing')).toBe('https://example.com/de/pricing');
  });

  it('builds root URL for default locale', () => {
    expect(buildCanonicalUrl('en', '')).toBe('https://example.com');
  });

  it('builds root URL for non-default locale', () => {
    expect(buildCanonicalUrl('de', '')).toBe('https://example.com/de');
  });

  it('handles nested slugs', () => {
    expect(buildCanonicalUrl('en', 'blog/my-post')).toBe('https://example.com/blog/my-post');
    expect(buildCanonicalUrl('de', 'blog/my-post')).toBe('https://example.com/de/blog/my-post');
  });
});
