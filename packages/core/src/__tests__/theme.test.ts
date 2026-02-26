import { describe, it, expect } from 'vitest';
import {
  hexToHsl,
  hslToHex,
  hexToOklch,
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
    const [h, s, l] = hexToHsl('#059669');
    // Roughly emerald green
    expect(h).toBeGreaterThan(155);
    expect(h).toBeLessThan(170);
    expect(s).toBeGreaterThan(90);
    expect(l).toBeGreaterThan(25);
    expect(l).toBeLessThan(35);
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
  const approxColors = ['#059669', '#067647'];
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

// ─── hexToOklch ─────────────────────────────────────────────────

describe('hexToOklch', () => {
  it('converts pure black to L≈0', () => {
    const [l, c] = hexToOklch('#000000');
    expect(l).toBeCloseTo(0, 2);
    expect(c).toBeCloseTo(0, 2);
  });

  it('converts pure white to L≈1', () => {
    const [l, c] = hexToOklch('#ffffff');
    expect(l).toBeCloseTo(1, 2);
    expect(c).toBeCloseTo(0, 2);
  });

  it('converts pure red to hue ≈ 29', () => {
    const [l, c, h] = hexToOklch('#ff0000');
    expect(l).toBeGreaterThan(0.5);
    expect(c).toBeGreaterThan(0.2);
    expect(h).toBeGreaterThan(20);
    expect(h).toBeLessThan(35);
  });

  it('converts emerald green with expected oklch values', () => {
    const [l, c, h] = hexToOklch('#059669');
    expect(l).toBeCloseTo(0.596, 2);
    expect(c).toBeCloseTo(0.127, 2);
    expect(h).toBeGreaterThan(160);
    expect(h).toBeLessThan(170);
  });

  it('converts indigo/purple', () => {
    const [l, c, h] = hexToOklch('#5d5bd4');
    expect(l).toBeGreaterThan(0.4);
    expect(l).toBeLessThan(0.7);
    expect(c).toBeGreaterThan(0.1);
    // Purple hue is around 280-310 in oklch
    expect(h).toBeGreaterThan(270);
    expect(h).toBeLessThan(320);
  });
});

// ─── generateColorScale ────────────────────────────────────────

describe('generateColorScale', () => {
  it('produces all 11 scale steps', () => {
    const scale = generateColorScale('#059669');
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
    const scale = generateColorScale('#059669');
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
    expect(css).toContain('#059669');
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

  it('uses custom primary color in legacy tokens', () => {
    const css = generateShadcnTokens({ primary: '#ff0000' });
    expect(css).toContain('--ss-primary: #ff0000');
  });

  it('derives brand/primary from user primary color', () => {
    const css = generateShadcnTokens({ primary: '#5d5bd4' });
    const rootBlock = css.split('.dark {')[0];
    // Should NOT contain hardcoded emerald green
    expect(rootBlock).not.toContain('oklch(0.6531 0.1436 161.43)');
    // Should contain oklch values derived from the indigo primary
    expect(rootBlock).toMatch(/--brand: oklch\([\d.]+ [\d.]+ [\d.]+\)/);
    expect(rootBlock).toMatch(/--primary: oklch\([\d.]+ [\d.]+ [\d.]+\)/);
  });

  it('default primary produces emerald oklch brand colors', () => {
    const css = generateShadcnTokens({});
    const rootBlock = css.split('.dark {')[0];
    // Default #059669 should produce emerald-like oklch values
    expect(rootBlock).toMatch(/--brand: oklch\(0\.5\d+ 0\.1\d+ 16\d\.\d+\)/);
  });

  it('brand and primary match in light mode', () => {
    const css = generateShadcnTokens({ primary: '#ff0000' });
    const rootBlock = css.split('.dark {')[0];
    const brandMatch = rootBlock.match(/--brand: (oklch\([^)]+\))/);
    const primaryMatch = rootBlock.match(/--primary: (oklch\([^)]+\))/);
    expect(brandMatch).not.toBeNull();
    expect(brandMatch![1]).toBe(primaryMatch![1]);
  });

  it('dark mode brand is lighter than light mode brand', () => {
    const css = generateShadcnTokens({ primary: '#059669' });
    const rootBlock = css.split('.dark {')[0];
    const darkBlock = css.split('.dark {')[1];
    const lightBrand = rootBlock.match(/--brand: oklch\(([\d.]+)/);
    const darkBrand = darkBlock.match(/--brand: oklch\(([\d.]+)/);
    expect(parseFloat(darkBrand![1])).toBeGreaterThan(parseFloat(lightBrand![1]));
  });

  it('dark mode border is not too bright', () => {
    const css = generateShadcnTokens({});
    const darkBlock = css.split('.dark {')[1];
    const borderMatch = darkBlock.match(/--border: oklch\(([\d.]+)/);
    expect(borderMatch).not.toBeNull();
    // Border lightness should be below 0.4 for dark mode (not 0.885!)
    expect(parseFloat(borderMatch![1])).toBeLessThan(0.4);
  });

  it('destructive uses oklch red', () => {
    const css = generateShadcnTokens({});
    expect(css).toContain('--destructive: oklch(0.577 0.245 27.325)');
  });

  it('dark mode uses oklch dark background', () => {
    const css = generateShadcnTokens({});
    const darkBlock = css.split('.dark {')[1];
    expect(darkBlock).toContain('--background: oklch(0.1405 0.0044 285.82)');
  });
});
