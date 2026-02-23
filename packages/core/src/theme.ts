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
  const primary = colors.primary || '#5d5bd4';
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
 * Generate shadcn/ui-compatible CSS tokens from user colors.
 * Produces a :root block with --primary, --background, --foreground, etc.
 */
export function generateShadcnTokens(config: {
  colors?: {
    primary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
}): string {
  const colors = config.colors || {};
  const primary = colors.primary || '#5d5bd4';
  const accent = colors.accent || '#067647';
  const background = colors.background || '#ffffff';
  const text = colors.text || '#1f2a37';

  const [pH, pS, pL] = hexToHsl(primary);
  const [aH, aS, aL] = hexToHsl(accent);
  const [bH, bS, bL] = hexToHsl(background);
  const [tH, tS, tL] = hexToHsl(text);

  // Generate derived colors
  // Saturated colors appear darker than their HSL lightness — adjust threshold
  const primaryFg = pL > 70 ? `${tH} ${tS}% 15%` : `0 0% 98%`;
  const brandFg = `${pH} ${Math.min(pS + 10, 100)}% ${Math.min(pL + 10, 85)}%`;

  // Muted: desaturated, lighter version of background
  const mutedS = Math.max(bS - 2, 0);
  const muted = `${bH} ${mutedS}% 93%`;
  const mutedFg = `${tH} ${Math.max(tS - 5, 0)}% 45%`;

  // Card: slightly different from background
  const card = `${bH} ${bS}% 100%`;
  const cardFg = `${tH} ${tS}% ${tL}%`;

  // Border/input
  const borderL = Math.max(bL - 8, 0);
  const border = `${bH} ${Math.max(bS - 3, 0)}% ${borderL}%`;
  const input = border;
  const ring = `${tH} ${Math.max(tS - 5, 0)}% 70%`;

  // Secondary
  const secondary = muted;
  const secondaryFg = `${tH} ${tS}% 20%`;

  // Accent (shadcn meaning: hover background)
  const accentBg = `${bH} ${mutedS}% 90%`;
  const accentFg = `${tH} ${tS}% 20%`;

  // Destructive
  const destructive = `0 72% 51%`;
  const destructiveFg = `0 72% 51%`;

  // Popover = card
  const popover = card;
  const popoverFg = cardFg;

  // Shadow
  const shadow = '#00000008';

  // Dark mode tokens derived from primary hue
  const darkBgH = pH;
  const darkBgS = Math.min(Math.round(pS * 0.6), 50);
  const darkBg = `${darkBgH} ${darkBgS}% 4%`;
  const darkFg = `0 0% 98%`;
  const darkCard = `${darkBgH} ${darkBgS}% 6%`;
  const darkMuted = `${darkBgH} ${Math.round(darkBgS * 0.8)}% 15%`;
  const darkMutedFg = `${darkBgH} ${Math.round(darkBgS * 0.4)}% 65%`;
  const darkBorder = `${darkBgH} ${Math.round(darkBgS * 0.7)}% 14%`;
  const darkInput = `${darkBgH} ${Math.round(darkBgS * 0.7)}% 18%`;
  const darkRing = `${pH} ${Math.round(pS * 0.5)}% 60%`;
  const darkBrandFg = `${pH} ${Math.min(pS + 10, 100)}% ${Math.min(pL + 15, 80)}%`;

  return `:root {
  /* Brand colors */
  --brand: hsl(${pH} ${pS}% ${pL}%);
  --brand-foreground: hsl(${brandFg});

  /* Primary */
  --primary: hsl(${pH} ${pS}% ${pL}%);
  --primary-foreground: hsl(${primaryFg});

  /* Background & Foreground */
  --background: hsl(${bH} ${bS}% ${bL}%);
  --foreground: hsl(${tH} ${tS}% ${tL}%);

  /* Card */
  --card: hsl(${card});
  --card-foreground: hsl(${cardFg});

  /* Popover */
  --popover: hsl(${popover});
  --popover-foreground: hsl(${popoverFg});

  /* Secondary */
  --secondary: hsl(${secondary});
  --secondary-foreground: hsl(${secondaryFg});

  /* Muted */
  --muted: hsl(${muted});
  --muted-foreground: hsl(${mutedFg});

  /* Accent */
  --accent: hsl(${accentBg});
  --accent-foreground: hsl(${accentFg});

  /* Destructive */
  --destructive: hsl(${destructive});
  --destructive-foreground: hsl(${destructiveFg});

  /* Borders & Input */
  --border: hsl(${border});
  --input: hsl(${input});
  --ring: hsl(${ring});

  /* Radius */
  --radius: 0.625rem;

  /* Line width for Launch UI utilities */
  --line-width: 1px;

  /* Shadows */
  --shadow: ${shadow};
  --shadow-strong: #00000010;

  /* Legacy --ss-* tokens (keep for backwards compat during transition) */
  --ss-primary: ${primary};
  --ss-accent: ${accent};
  --ss-background: ${background};
  --ss-text: ${text};
}

.dark {
  --brand: hsl(${pH} ${pS}% ${pL}%);
  --brand-foreground: hsl(${darkBrandFg});
  --primary: hsl(${pH} ${pS}% ${pL}%);
  --primary-foreground: hsl(0 0% 98%);
  --background: hsl(${darkBg});
  --foreground: hsl(${darkFg});
  --card: hsl(${darkCard});
  --card-foreground: hsl(${darkFg});
  --popover: hsl(${darkCard});
  --popover-foreground: hsl(${darkFg});
  --secondary: hsl(${darkMuted});
  --secondary-foreground: hsl(${darkFg});
  --muted: hsl(${darkMuted});
  --muted-foreground: hsl(${darkMutedFg});
  --accent: hsl(${darkMuted});
  --accent-foreground: hsl(${darkFg});
  --destructive: hsl(0 62% 30%);
  --destructive-foreground: hsl(${darkFg});
  --border: hsl(${darkBorder});
  --input: hsl(${darkInput});
  --ring: hsl(${darkRing});
  --radius: 0.625rem;
  --line-width: 1px;
  --shadow: #00000040;
  --shadow-strong: #00000060;
  --ss-primary: ${primary};
  --ss-accent: ${accent};
}
`;
}
