import { join, relative, dirname } from 'path';
import { existsSync, writeFileSync, realpathSync } from 'fs';
import { generateShadcnTokens } from '@shipsite.dev/core/theme';
import type { GeneratorContext } from './types.js';

function resolveComponentsSource(rootDir: string, cssDir: string): { sourceDirective: string; utilsCssImport: string } {
  let searchDir = rootDir;
  for (let i = 0; i < 10; i++) {
    const pkgDir = join(searchDir, 'node_modules', '@shipsite.dev', 'components');
    const srcCandidate = join(pkgDir, 'src');
    const distCandidate = join(pkgDir, 'dist');
    const candidate = existsSync(srcCandidate) ? srcCandidate : existsSync(distCandidate) ? distCandidate : null;
    if (candidate) {
      const realPath = realpathSync(candidate);
      const rel = relative(cssDir, realPath).split('\\').join('/');
      let utilsCssImport = '';
      const utilsCssPath = join(realPath, 'styles', 'utils.css');
      if (existsSync(utilsCssPath)) {
        const utilsRel = relative(cssDir, utilsCssPath).split('\\').join('/');
        utilsCssImport = `\n@import "${utilsRel}";`;
      }
      return { sourceDirective: `\n@source "${rel}";`, utilsCssImport };
    }
    const parent = dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }
  return { sourceDirective: '', utilsCssImport: '' };
}

export function generateStyles(ctx: GeneratorContext): void {
  const cssDir = join(ctx.srcDir, 'styles');
  const { sourceDirective, utilsCssImport } = resolveComponentsSource(ctx.rootDir, cssDir);
  const shadcnTokens = generateShadcnTokens(ctx.config.colors || {});

  writeFileSync(
    join(cssDir, 'globals.css'),
    `@import 'tailwindcss';${sourceDirective}${utilsCssImport}

@import 'tw-animate-css';

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);

  --spacing-container: 1280px;
  --spacing-container-lg: 1536px;

  --shadow-md: 0 4px 6px -1px var(--shadow), 0 2px 4px -2px var(--shadow);
  --shadow-xl: 0 20px 25px -5px var(--shadow), 0 8px 10px -6px var(--shadow);
  --shadow-2xl: 0 25px 50px -12px var(--shadow);
  --shadow-mockup: -12px 16px 48px var(--shadow-strong);

  --line-width: 1px;

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-appear: appear 0.6s forwards ease-out;
  --animate-appear-zoom: appear-zoom 0.6s forwards ease-out;

  @keyframes accordion-down {
    from { height: 0; }
    to { height: var(--radix-accordion-content-height); }
  }
  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); }
    to { height: 0; }
  }
  @keyframes appear {
    0% { opacity: 0; transform: translateY(1rem); filter: blur(0.5rem); }
    50% { filter: blur(0); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes appear-zoom {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }
}

${shadcnTokens}
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  html { scroll-behavior: smooth; }
}

.container-main {
  width: 100%;
  max-width: 76rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 3rem);
}

@layer utilities {
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-100% - var(--marquee-gap))); }
  }
  .animate-marquee {
    flex-shrink: 0;
    animation: marquee var(--marquee-duration, 30s) linear infinite;
  }
}

.page-prose > * {
  width: 100%;
  max-width: 76rem;
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 3rem);
}
.page-prose > h2 { margin-top: 2.5rem; margin-bottom: 1rem; font-size: clamp(1.375rem, 1.1rem + 1.2vw, 2.25rem); font-weight: 600; }
.page-prose > h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-size: clamp(1.125rem, 1rem + 0.6vw, 1.5rem); font-weight: 600; }
.page-prose > p { font-size: 1rem; line-height: 1.6; margin-top: 0.5rem; margin-bottom: 0.5rem; }
.page-prose > ul { list-style: disc; padding-left: 1.75rem; margin-block: 0.75rem; }
.page-prose > ol { list-style: decimal; padding-left: 1.75rem; margin-block: 0.75rem; }
.page-prose > p a { color: var(--primary); text-decoration: underline; font-weight: 500; }
.page-prose > p a:hover { text-decoration: none; }
`,
  );
}
