import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}));

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { validateLinks } from '../commands/validate-links.js';

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockStatSync = vi.mocked(statSync);

// ─── helpers ──────────────────────────────────────────────

function run(
  config: Parameters<typeof validateLinks>[0],
  setupFs?: () => void,
) {
  // Default: contentDir does not exist (no MDX scanning)
  mockExistsSync.mockReturnValue(false);

  if (setupFs) setupFs();

  const result = validateLinks(config, '/content');
  return {
    errors: result.errors.map((e) => `${e.message}${e.page ? ` in ${e.page}` : ''}`),
    warnings: result.warnings.map((w) => `${w.message}${w.page ? ` in ${w.page}` : ''}`),
  };
}

const basePages = [
  { slug: '' },
  { slug: 'features' },
  { slug: 'pricing' },
  { slug: 'blog' },
  { slug: 'blog/getting-started' },
  { slug: 'privacy' },
  { slug: 'terms' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

// ─── navigation links ─────────────────────────────────────

describe('navigation links', () => {
  it('passes when all navigation hrefs match valid slugs', () => {
    const { errors } = run({
      pages: basePages,
      navigation: {
        items: [
          { href: '/features' },
          { href: '/pricing' },
          { href: '/blog' },
        ],
      },
    });
    expect(errors).toHaveLength(0);
  });

  it('reports dead navigation link', () => {
    const { errors } = run({
      pages: basePages,
      navigation: {
        items: [{ href: '/nonexistent' }],
      },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/nonexistent');
    expect(errors[0]).toContain('navigation');
  });

  it('skips external navigation links', () => {
    const { errors } = run({
      pages: basePages,
      navigation: {
        items: [
          { href: 'https://example.com' },
          { href: 'mailto:hi@example.com' },
          { href: 'tel:+1234567890' },
          { href: '#section' },
        ],
      },
    });
    expect(errors).toHaveLength(0);
  });

  it('reports dead CTA link', () => {
    const { errors } = run({
      pages: basePages,
      navigation: {
        items: [],
        cta: { href: '/signup' },
      },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/signup');
    expect(errors[0]).toContain('navigation CTA');
  });

  it('skips external CTA link', () => {
    const { errors } = run({
      pages: basePages,
      navigation: {
        items: [],
        cta: { href: 'https://app.example.com/signup' },
      },
    });
    expect(errors).toHaveLength(0);
  });
});

// ─── footer links ─────────────────────────────────────────

describe('footer links', () => {
  it('passes when all footer hrefs match valid slugs', () => {
    const { errors } = run({
      pages: basePages,
      footer: {
        columns: [
          { links: [{ href: '/features' }, { href: '/pricing' }] },
          { links: [{ href: '/privacy' }, { href: '/terms' }] },
        ],
      },
    });
    expect(errors).toHaveLength(0);
  });

  it('reports dead footer link', () => {
    const { errors } = run({
      pages: basePages,
      footer: {
        columns: [{ links: [{ href: '/does-not-exist' }] }],
      },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/does-not-exist');
    expect(errors[0]).toContain('footer');
  });

  it('skips external footer links', () => {
    const { errors } = run({
      pages: basePages,
      footer: {
        columns: [
          {
            links: [
              { href: 'https://twitter.com/example' },
              { href: 'mailto:info@example.com' },
            ],
          },
        ],
      },
    });
    expect(errors).toHaveLength(0);
  });
});

// ─── MDX content links ───────────────────────────────────

function setupMdxFs(files: Record<string, string>) {
  return () => {
    mockExistsSync.mockReturnValue(true);

    const entries = Object.keys(files).map((f) => f.split('/').pop()!);

    mockReaddirSync.mockReturnValue(entries as any);
    mockStatSync.mockReturnValue({ isDirectory: () => false } as any);
    mockReadFileSync.mockImplementation((p: any) => {
      const name = String(p).split('/').pop()!;
      return files[name] ?? '';
    });
  };
}

describe('MDX content links', () => {
  it('reports dead markdown link in MDX', () => {
    const { errors } = run(
      { pages: basePages },
      setupMdxFs({ 'en.mdx': 'Check out [this page](/nonexistent) for more.' }),
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/nonexistent');
    expect(errors[0]).toContain('content/');
  });

  it('passes valid markdown link in MDX', () => {
    const { errors } = run(
      { pages: basePages },
      setupMdxFs({ 'en.mdx': 'Check out [features](/features) page.' }),
    );
    expect(errors).toHaveLength(0);
  });

  it('reports dead JSX href in MDX', () => {
    const { errors } = run(
      { pages: basePages },
      setupMdxFs({ 'en.mdx': '<Button href="/missing-page">Click</Button>' }),
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/missing-page');
  });

  it('passes valid JSX href in MDX', () => {
    const { errors } = run(
      { pages: basePages },
      setupMdxFs({ 'en.mdx': '<Button href="/pricing">Buy</Button>' }),
    );
    expect(errors).toHaveLength(0);
  });

  it('skips external links in MDX', () => {
    const { errors } = run(
      { pages: basePages },
      setupMdxFs({
        'en.mdx': [
          '[Google](https://google.com)',
          '[Email](mailto:a@b.com)',
          '<a href="tel:+123">Call</a>',
          '[Section](#faq)',
        ].join('\n'),
      }),
    );
    expect(errors).toHaveLength(0);
  });

  it('finds multiple dead links in one file', () => {
    const { errors } = run(
      { pages: basePages },
      setupMdxFs({
        'en.mdx': [
          '[A](/aaa)',
          '[B](/bbb)',
          '<Link href="/ccc">C</Link>',
        ].join('\n'),
      }),
    );
    expect(errors).toHaveLength(3);
  });

  it('skips scanning when contentDir does not exist', () => {
    const { errors } = run(
      {
        pages: basePages,
        navigation: { items: [{ href: '/features' }] },
      },
      // existsSync returns false by default → no MDX scanning
    );
    expect(errors).toHaveLength(0);
  });
});

// ─── edge cases ───────────────────────────────────────────

describe('edge cases', () => {
  it('handles root slug (empty string → "/")', () => {
    const { errors } = run({
      pages: [{ slug: '' }],
      navigation: { items: [{ href: '/' }] },
    });
    expect(errors).toHaveLength(0);
  });

  it('normalizes trailing slash', () => {
    const { errors } = run({
      pages: basePages,
      navigation: { items: [{ href: '/features/' }] },
    });
    expect(errors).toHaveLength(0);
  });

  it('handles nested slug like blog/getting-started', () => {
    const { errors } = run({
      pages: basePages,
      navigation: { items: [{ href: '/blog/getting-started' }] },
    });
    expect(errors).toHaveLength(0);
  });

  it('handles missing navigation and footer gracefully', () => {
    const { errors } = run({ pages: basePages });
    expect(errors).toHaveLength(0);
  });

  it('handles missing pages gracefully', () => {
    const { errors } = run({});
    expect(errors).toHaveLength(0);
  });
});
