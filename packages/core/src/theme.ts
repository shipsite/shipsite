/**
 * Generate a full color scale (50-950) from a hex color.
 * Uses HSL manipulation to create lighter and darker variants.
 */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convert a hex color to OKLch (Lightness, Chroma, Hue).
 * Uses the standard sRGB → linear RGB → XYZ → OKLab → OKLch pipeline.
 */
export function hexToOklch(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // sRGB → linear sRGB (undo gamma)
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  // linear sRGB → LMS (cone response)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // Cube root (nonlinear compression)
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // LMS → OKLab
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // OKLab → OKLch
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return [L, C, H];
}

/** Format an oklch value as a CSS string with 4 decimal places. */
function oklchStr(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)})`;
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const SCALE_STEPS: Record<number, number> = {
  50: 96,
  100: 91,
  200: 82,
  300: 71,
  400: 60,
  500: 50,
  600: 42,
  700: 34,
  800: 26,
  900: 20,
  950: 14,
};

export function generateColorScale(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex);
  const scale: Record<string, string> = {};

  for (const [step, lightness] of Object.entries(SCALE_STEPS)) {
    scale[step] = hslToHex(h, s, lightness);
  }

  return scale;
}

export function generateCSSVariables(config: {
  colors?: {
    primary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
}): string {
  const colors = config.colors || {};
  const primary = colors.primary || '#059669';
  const accent = colors.accent || '#067647';
  const background = colors.background || '#ffffff';
  const text = colors.text || '#1f2a37';

  const primaryScale = generateColorScale(primary);
  const accentScale = generateColorScale(accent);

  let css = ':root {\n';
  css += `  --ss-primary: ${primary};\n`;
  css += `  --ss-accent: ${accent};\n`;
  css += `  --ss-background: ${background};\n`;
  css += `  --ss-text: ${text};\n`;

  for (const [step, color] of Object.entries(primaryScale)) {
    css += `  --ss-primary-${step}: ${color};\n`;
  }
  for (const [step, color] of Object.entries(accentScale)) {
    css += `  --ss-accent-${step}: ${color};\n`;
  }

  css += '}\n';
  return css;
}

/**
 * Generate shadcn/ui-compatible CSS tokens derived from the user's primary color.
 * Converts the primary hex color to oklch and generates light/dark mode variants.
 */
export function generateShadcnTokens(colors: {
  primary?: string;
  accent?: string;
  background?: string;
  text?: string;
} = {}): string {
  const primary = colors.primary || '#059669';
  const accent = colors.accent || '#067647';
  const background = colors.background || '#ffffff';
  const text = colors.text || '#1f2a37';

  // Convert primary to oklch for brand/primary tokens
  const [pL, pC, pH] = hexToOklch(primary);

  // Light mode: use the color as-is; foreground is a lighter tint
  const brandLight = oklchStr(pL, pC, pH);
  const brandFgLight = oklchStr(Math.min(pL + 0.16, 0.95), pC, pH);

  // Dark mode: boost lightness for visibility on dark backgrounds
  const brandDark = oklchStr(Math.min(pL + 0.2, 0.85), pC * 0.9, pH);
  const brandFgDark = oklchStr(Math.max(pL, 0.7), pC, pH);

  return `:root {
  /* Brand colors — derived from primary ${primary} */
  --brand: ${brandLight};
  --brand-foreground: ${brandFgLight};

  /* Primary */
  --primary: ${brandLight};
  --primary-foreground: oklch(0.985 0 0);

  /* Background & Foreground */
  --background: oklch(0.9753 0.0045 254.98);
  --foreground: oklch(0.141 0.005 285.823);

  /* Card */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);

  /* Popover */
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);

  /* Secondary */
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);

  /* Muted */
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);

  /* Accent */
  --accent: oklch(0.927 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);

  /* Destructive */
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);

  /* Borders & Input */
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);

  /* Radius */
  --radius: 0.625rem;

  /* Line width for Launch UI utilities */
  --line-width: 1px;

  /* Shadows */
  --shadow: #00000008;
  --shadow-strong: #00000008;

  /* Legacy --ss-* tokens */
  --ss-primary: ${primary};
  --ss-accent: ${accent};
  --ss-background: ${background};
  --ss-text: ${text};
}

.dark {
  --brand: ${brandDark};
  --brand-foreground: ${brandFgDark};
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --background: oklch(0.1405 0.0044 285.82);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.141 0.005 285.823);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.141 0.005 285.823);
  --popover-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.274 0.006 286.033);
  --input: oklch(0.274 0.006 286.033);
  --ring: oklch(0.442 0.017 285.786);
  --radius: 0.625rem;
  --line-width: 1px;
  --shadow: #00000020;
  --shadow-strong: #00000088;
  --ss-primary: ${primary};
  --ss-accent: ${accent};
}
`;
}
