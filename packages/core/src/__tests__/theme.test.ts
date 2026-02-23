import { describe, it, expect } from 'vitest';
import {
  hexToHsl,
  hslToHex,
  generateColorScale,
  generateCSSVariables,
  generateShadcnTokens,
} from '../theme';

// ─── hexToHsl ──────────────────────────────────────────────────

describe('hexToHsl', () => {
  it('converts pure black', () => {
    expect(hexToHsl('#000000')).toEqual([0, 0, 0]);
  });

  it('converts pure white', () => {
    expect(hexToHsl('#ffffff')).toEqual([0, 0, 100]);
  });

  it('converts pure red', () => {
    expect(hexToHsl('#ff0000')).toEqual([0, 100, 50]);
  });

  it('converts pure green', () => {
    expect(hexToHsl('#00ff00')).toEqual([120, 100, 50]);
  });

  it('converts pure blue', () => {
    expect(hexToHsl('#0000ff')).toEqual([240, 100, 50]);
  });

  it('converts a mid-gray (achromatic)', () => {
    const [h, s, l] = hexToHsl('#808080');
    expect(h).toBe(0);
    expect(s).toBe(0);
    // Achromatic early-return path doesn't round, so allow small float difference
    expect(Math.round(l)).toBe(50);
  });

  it('converts the default primary color', () => {
    const [h, s, l] = hexToHsl('#5d5bd4');
    // Roughly purple
    expect(h).toBeGreaterThan(230);
    expect(h).toBeLessThan(250);
    expect(s).toBeGreaterThan(50);
    expect(l).toBeGreaterThan(50);
    expect(l).toBeLessThan(65);
  });

  it('converts the default accent color', () => {
    const [h, s, l] = hexToHsl('#067647');
    // Green
    expect(h).toBeGreaterThan(140);
    expect(h).toBeLessThan(160);
    expect(s).toBeGreaterThan(80);
  });
});

// ─── hslToHex ──────────────────────────────────────────────────

describe('hslToHex', () => {
  it('converts black', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });

  it('converts white', () => {
    expect(hslToHex(0, 0, 100)).toBe('#ffffff');
  });

  it('converts pure red', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  it('converts pure green', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00');
  });

  it('converts pure blue', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000ff');
  });

  it('converts zero saturation to gray', () => {
    const hex = hslToHex(180, 0, 50);
    // Should be gray — all channels equal
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    const r = hex.slice(1, 3);
    const g = hex.slice(3, 5);
    const b = hex.slice(5, 7);
    expect(r).toBe(g);
    expect(g).toBe(b);
  });
});

// ─── roundtrip ─────────────────────────────────────────────────

describe('hexToHsl ↔ hslToHex roundtrip', () => {
  // Exact roundtrips only work for pure primaries (no rounding loss)
  const exactColors = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];
  for (const hex of exactColors) {
    it(`roundtrips ${hex} exactly`, () => {
      const [h, s, l] = hexToHsl(hex);
      const result = hslToHex(h, s, l);
      expect(result.toLowerCase()).toBe(hex.toLowerCase());
    });
  }

  // Complex colors lose precision from HSL integer rounding — verify they're close
  const approxColors = ['#5d5bd4', '#067647'];
  for (const hex of approxColors) {
    it(`roundtrips ${hex} approximately (within rounding tolerance)`, () => {
      const [h, s, l] = hexToHsl(hex);
      const result = hslToHex(h, s, l);
      // Each channel should be within ±2 of the original
      for (let i = 1; i < 7; i += 2) {
        const orig = parseInt(hex.slice(i, i + 2), 16);
        const conv = parseInt(result.slice(i, i + 2), 16);
        expect(Math.abs(orig - conv)).toBeLessThanOrEqual(2);
      }
    });
  }
});

// ─── generateColorScale ────────────────────────────────────────

describe('generateColorScale', () => {
  it('produces all 11 scale steps', () => {
    const scale = generateColorScale('#5d5bd4');
    const keys = Object.keys(scale);
    expect(keys).toHaveLength(11);
    expect(keys).toEqual(
      expect.arrayContaining(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']),
    );
  });

  it('outputs valid hex values', () => {
    const scale = generateColorScale('#067647');
    for (const hex of Object.values(scale)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('scale-50 is lighter than scale-950', () => {
    const scale = generateColorScale('#5d5bd4');
    const l50 = hexToHsl(scale['50'])[2];
    const l950 = hexToHsl(scale['950'])[2];
    expect(l50).toBeGreaterThan(l950);
  });
});

// ─── generateCSSVariables ──────────────────────────────────────

describe('generateCSSVariables', () => {
  it('generates :root block', () => {
    const css = generateCSSVariables({});
    expect(css).toContain(':root {');
    expect(css).toContain('--ss-primary:');
    expect(css).toContain('--ss-accent:');
  });

  it('uses default colors when empty config provided', () => {
    const css = generateCSSVariables({});
    expect(css).toContain('#5d5bd4');
    expect(css).toContain('#067647');
  });

  it('uses custom colors when provided', () => {
    const css = generateCSSVariables({
      colors: { primary: '#ff0000', accent: '#00ff00' },
    });
    expect(css).toContain('#ff0000');
    expect(css).toContain('#00ff00');
  });

  it('includes primary and accent scale variables', () => {
    const css = generateCSSVariables({});
    expect(css).toContain('--ss-primary-50:');
    expect(css).toContain('--ss-primary-950:');
    expect(css).toContain('--ss-accent-50:');
    expect(css).toContain('--ss-accent-950:');
  });
});

// ─── generateShadcnTokens ─────────────────────────────────────

describe('generateShadcnTokens', () => {
  it('generates both :root and .dark blocks', () => {
    const css = generateShadcnTokens({});
    expect(css).toContain(':root {');
    expect(css).toContain('.dark {');
  });

  it('includes all required CSS variables in :root', () => {
    const css = generateShadcnTokens({});
    const rootBlock = css.split('.dark {')[0];
    const requiredVars = [
      '--brand:', '--brand-foreground:',
      '--primary:', '--primary-foreground:',
      '--background:', '--foreground:',
      '--card:', '--card-foreground:',
      '--popover:', '--popover-foreground:',
      '--secondary:', '--secondary-foreground:',
      '--muted:', '--muted-foreground:',
      '--accent:', '--accent-foreground:',
      '--destructive:', '--destructive-foreground:',
      '--border:', '--input:', '--ring:',
      '--radius:', '--line-width:',
      '--shadow:', '--shadow-strong:',
    ];
    for (const v of requiredVars) {
      expect(rootBlock).toContain(v);
    }
  });

  it('includes all required CSS variables in .dark', () => {
    const css = generateShadcnTokens({});
    const darkBlock = css.split('.dark {')[1];
    const requiredVars = [
      '--brand:', '--primary:', '--background:', '--foreground:',
      '--card:', '--popover:', '--secondary:', '--muted:',
      '--accent:', '--destructive:', '--border:', '--input:', '--ring:',
    ];
    for (const v of requiredVars) {
      expect(darkBlock).toContain(v);
    }
  });

  it('uses custom primary color in output', () => {
    const css = generateShadcnTokens({ colors: { primary: '#ff0000' } });
    expect(css).toContain('--ss-primary: #ff0000');
  });

  it('primary-foreground switches based on lightness', () => {
    // Dark primary (pL < 50) → light foreground in :root
    const darkPrimary = generateShadcnTokens({ colors: { primary: '#1a1a8a' } });
    const darkRoot = darkPrimary.split('.dark {')[0];
    expect(darkRoot).toContain('--primary-foreground: hsl(0 0% 98%)');

    // Light primary (pL > 50) → dark foreground in :root
    const lightPrimary = generateShadcnTokens({ colors: { primary: '#c0c0ff' } });
    const lightRoot = lightPrimary.split('.dark {')[0];
    // Should NOT have the 98% white foreground in :root
    expect(lightRoot).not.toMatch(/--primary-foreground: hsl\(0 0% 98%\)/);
    // Should have a dark foreground instead
    expect(lightRoot).toMatch(/--primary-foreground: hsl\(\d+ \d+% 15%\)/);
  });

  it('destructive is hardcoded red', () => {
    const css = generateShadcnTokens({});
    expect(css).toContain('--destructive: hsl(0 72% 51%)');
  });

  it('dark mode uses darker background than light mode', () => {
    const css = generateShadcnTokens({});
    // Dark mode background has 4% lightness
    const darkBlock = css.split('.dark {')[1];
    expect(darkBlock).toMatch(/--background: hsl\(\d+ \d+% 4%\)/);
  });
});
