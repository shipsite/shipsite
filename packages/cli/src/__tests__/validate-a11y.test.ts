import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}));

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { validateA11y } from '../commands/validate-a11y.js';

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockReaddirSync = vi.mocked(readdirSync);
const mockStatSync = vi.mocked(statSync);

// ─── helpers ──────────────────────────────────────────────

function run(files: Record<string, string>) {
  mockExistsSync.mockReturnValue(true);
  const entries = Object.keys(files).map((f) => f.split('/').pop()!);
  mockReaddirSync.mockReturnValue(entries as any);
  mockStatSync.mockReturnValue({ isDirectory: () => false } as any);
  mockReadFileSync.mockImplementation((p: any) => {
    const name = String(p).split('/').pop()!;
    return files[name] ?? '';
  });
  return validateA11y('/content');
}

beforeEach(() => {
  vi.resetAllMocks();
});

// ─── alt-text ─────────────────────────────────────────────

describe('alt-text', () => {
  it('detects markdown image with empty alt text', () => {
    const result = run({ 'en.mdx': '![](/images/hero.png)' });
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].rule).toBe('alt-text');
    expect(result.issues[0].message).toContain('missing alt text');
  });

  it('passes markdown image with alt text', () => {
    const result = run({ 'en.mdx': '![Hero banner](/images/hero.png)' });
    const altIssues = result.issues.filter((i) => i.rule === 'alt-text');
    expect(altIssues).toHaveLength(0);
  });

  it('detects <img> without alt attribute', () => {
    const result = run({ 'en.mdx': '<img src="/images/photo.jpg" />' });
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].rule).toBe('alt-text');
    expect(result.issues[0].message).toContain('<img>');
  });

  it('passes <img> with alt attribute', () => {
    const result = run({ 'en.mdx': '<img src="/images/photo.jpg" alt="A photo" />' });
    const altIssues = result.issues.filter((i) => i.rule === 'alt-text');
    expect(altIssues).toHaveLength(0);
  });

  it('reports correct line number', () => {
    const result = run({ 'en.mdx': 'line 1\nline 2\n![](/images/x.png)\nline 4' });
    expect(result.issues[0].line).toBe(3);
  });
});

// ─── heading-hierarchy ────────────────────────────────────

describe('heading-hierarchy', () => {
  it('detects skipped heading levels', () => {
    const result = run({ 'en.mdx': '## Section\n\n#### Subsection' });
    const issues = result.issues.filter((i) => i.rule === 'heading-hierarchy');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('h2 → h4');
    expect(issues[0].message).toContain('missing h3');
  });

  it('passes correct heading hierarchy', () => {
    const result = run({ 'en.mdx': '## Section\n\n### Subsection\n\n#### Detail' });
    const issues = result.issues.filter((i) => i.rule === 'heading-hierarchy');
    expect(issues).toHaveLength(0);
  });

  it('detects multiple H1 headings', () => {
    const result = run({ 'en.mdx': '# Title\n\nContent\n\n# Another Title' });
    const issues = result.issues.filter(
      (i) => i.rule === 'heading-hierarchy' && i.message.includes('Multiple h1'),
    );
    expect(issues).toHaveLength(1);
  });

  it('allows single H1', () => {
    const result = run({ 'en.mdx': '# Title\n\n## Section' });
    const issues = result.issues.filter(
      (i) => i.rule === 'heading-hierarchy' && i.message.includes('Multiple h1'),
    );
    expect(issues).toHaveLength(0);
  });

  it('detects h1 -> h3 skip', () => {
    const result = run({ 'en.mdx': '# Title\n\n### Subsection' });
    const issues = result.issues.filter(
      (i) => i.rule === 'heading-hierarchy' && i.message.includes('h1 → h3'),
    );
    expect(issues).toHaveLength(1);
  });
});

// ─── link-text ────────────────────────────────────────────

describe('link-text', () => {
  it('detects generic "click here" link text', () => {
    const result = run({ 'en.mdx': '[click here](/page)' });
    const issues = result.issues.filter((i) => i.rule === 'link-text');
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('click here');
  });

  it('detects "read more" link text', () => {
    const result = run({ 'en.mdx': '[Read More](/blog/post)' });
    const issues = result.issues.filter((i) => i.rule === 'link-text');
    expect(issues).toHaveLength(1);
  });

  it('detects "here" link text', () => {
    const result = run({ 'en.mdx': '[here](/page)' });
    const issues = result.issues.filter((i) => i.rule === 'link-text');
    expect(issues).toHaveLength(1);
  });

  it('passes descriptive link text', () => {
    const result = run({ 'en.mdx': '[View our pricing plans](/pricing)' });
    const issues = result.issues.filter((i) => i.rule === 'link-text');
    expect(issues).toHaveLength(0);
  });

  it('detects multiple bad links on the same line', () => {
    const result = run({ 'en.mdx': '[here](/a) and [click here](/b)' });
    const issues = result.issues.filter((i) => i.rule === 'link-text');
    expect(issues).toHaveLength(2);
  });
});

// ─── score & general ──────────────────────────────────────

describe('score and general', () => {
  it('returns score 100 when no issues', () => {
    const result = run({ 'en.mdx': '## Section\n\nSome content with [a good link](/page).' });
    expect(result.score).toBe(100);
  });

  it('deducts 5 points per issue', () => {
    const result = run({
      'en.mdx': '![](/a.png)\n![](/b.png)\n![](/c.png)',
    });
    expect(result.issues).toHaveLength(3);
    expect(result.score).toBe(85);
  });

  it('returns score 100 when contentDir does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    const result = validateA11y('/nonexistent');
    expect(result.issues).toHaveLength(0);
    expect(result.score).toBe(100);
  });

  it('score never goes below 0', () => {
    // 21 images without alt = 21 * 5 = 105, should clamp to 0
    const lines = Array.from({ length: 21 }, (_, i) => `![](/img${i}.png)`).join('\n');
    const result = run({ 'en.mdx': lines });
    expect(result.score).toBe(0);
  });
});
