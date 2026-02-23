import { join, dirname } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import type { GeneratorContext } from '../types.js';

interface Component {
  name: string;
  category: string;
  description: string;
}

interface ComponentsJson {
  components: Component[];
}

const BEGIN_MARKER = '<!-- BEGIN SHIPSITE AUTO-GENERATED - DO NOT EDIT THIS SECTION -->';
const END_MARKER = '<!-- END SHIPSITE AUTO-GENERATED -->';

function resolveComponentsJson(rootDir: string): ComponentsJson | null {
  let searchDir = rootDir;
  for (let i = 0; i < 10; i++) {
    const candidate = join(searchDir, 'node_modules', '@shipsite.dev', 'components', 'components.json');
    if (existsSync(candidate)) {
      return JSON.parse(readFileSync(candidate, 'utf-8'));
    }
    const parent = dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }
  return null;
}

function formatComponentCatalog(components: Component[]): string {
  const grouped: Record<string, Component[]> = {};
  for (const c of components) {
    const cat = c.category.charAt(0).toUpperCase() + c.category.slice(1);
    (grouped[cat] ??= []).push(c);
  }

  const lines: string[] = [];
  for (const [category, comps] of Object.entries(grouped)) {
    lines.push(`### ${category}`);
    for (const c of comps) {
      lines.push(`- **${c.name}** — ${c.description}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function buildSharedContent(ctx: GeneratorContext, components: ComponentsJson | null): string {
  const config = ctx.config;
  const siteName = config.name || 'ShipSite Project';
  const locales: string[] = config.i18n?.locales || ['en'];
  const defaultLocale: string = config.i18n?.defaultLocale || 'en';

  const componentCatalog = components ? formatComponentCatalog(components.components) : '_Components not found — run `npm install` first._';

  return `# ${siteName} — ShipSite Project

## Tech Stack

- **Framework:** Next.js (App Router)
- **Content:** MDX files in \`content/\` — processed by content-collections
- **Styling:** Tailwind CSS v4 + shadcn/ui design tokens
- **i18n:** next-intl (locales: ${locales.join(', ')} — default: ${defaultLocale})
- **Components:** \`@shipsite.dev/components\` — pre-built marketing, blog & legal components

## Project Structure

\`\`\`
shipsite.json          # Site configuration (pages, nav, footer, colors, i18n)
                       # Navigation & footer labels accept string | { locale: "text" } for i18n
content/               # MDX content files, one folder per page
  {page-name}/
    {locale}.mdx       # Content file per locale
components/            # Custom components (auto-available in MDX)
public/                # Static assets (images, fonts, favicons)
.shipsite/             # Generated workspace (do NOT edit)
\`\`\`

## Content Conventions

- Each page is an MDX file at \`content/{page-name}/{locale}.mdx\`
- Markdown is automatically styled — no need to import prose wrappers
- ShipSite components are globally available in MDX — no imports needed
- Images go in \`public/images/\` and are referenced as \`/images/filename.ext\`
- Custom components in \`components/\` are also auto-available in MDX

## Frontmatter by Page Type

### Landing / Page (\`type: "landing"\` or \`type: "page"\`)
\`\`\`yaml
---
title: "Page Title — Site Name"
description: "Meta description for SEO."
---
\`\`\`
Then use marketing components directly:
\`\`\`mdx
<Hero title="..." description="..." primaryCta={{ label: "...", href: "..." }} />
<Features title="...">
  <Feature title="..." description="..." />
</Features>
\`\`\`

### Blog Article (\`type: "blog-article"\`)
\`\`\`yaml
---
title: "Article Title"
description: "Meta description."
excerpt: "Short preview text for blog index cards."
date: "YYYY-MM-DD"
readingTime: 3
author: default
---
\`\`\`
Wrap content in \`<BlogArticle>\`:
\`\`\`mdx
<BlogArticle>

## Section Heading

Paragraph content with **bold** and [links](/path).

</BlogArticle>
\`\`\`

### Blog Index (\`type: "blog-index"\`)
\`\`\`yaml
---
title: "Blog — Site Name"
description: "Meta description."
---
\`\`\`
\`\`\`mdx
<BlogIndex title="Blog" description="Latest posts." />
\`\`\`

### Legal / Content (\`type: "legal"\`)
\`\`\`yaml
---
title: "Privacy Policy"
description: "How we handle your data."
---
\`\`\`
\`\`\`mdx
<ContentPage title="Privacy Policy" lastUpdated="YYYY-MM-DD">
  <ContentSection title="1. Section">Content here.</ContentSection>
</ContentPage>
\`\`\`

## Available Components

${componentCatalog}

## Key Rules

1. **Never edit files inside \`.shipsite/\`** — they are auto-generated and will be overwritten.
2. **Don't import ShipSite components** — they are globally registered in MDX.
3. **Page structure is defined in \`shipsite.json\`** — to add a page, add an entry to the \`pages\` array and create the content folder.
4. **One MDX file per locale per page** — e.g. \`content/landing/en.mdx\`, \`content/landing/de.mdx\`.
5. **Use the component catalog above** to pick the right component for each section.
`;
}

function writeWithPreservedContent(filePath: string, autoContent: string): void {
  let userContent = '';

  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf-8');
    const endIdx = existing.indexOf(END_MARKER);
    if (endIdx !== -1) {
      userContent = existing.slice(endIdx + END_MARKER.length);
    }
  }

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const output = `${BEGIN_MARKER}\n${autoContent}\n${END_MARKER}${userContent || '\n'}`;
  writeFileSync(filePath, output);
}

function writeCursorRules(filePath: string, content: string): void {
  let userContent = '';

  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf-8');
    const endIdx = existing.indexOf(END_MARKER);
    if (endIdx !== -1) {
      userContent = existing.slice(endIdx + END_MARKER.length);
    }
  }

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const frontmatter = `---
description: ShipSite project conventions, components, and content structure
globs: "**/*.mdx,**/*.tsx,shipsite.json"
alwaysApply: true
---
`;

  const output = `${frontmatter}${BEGIN_MARKER}\n${content}\n${END_MARKER}${userContent || '\n'}`;
  writeFileSync(filePath, output);
}

export function generateAiConfig(ctx: GeneratorContext): void {
  const components = resolveComponentsJson(ctx.rootDir);
  const content = buildSharedContent(ctx, components);

  // Claude Code
  writeWithPreservedContent(join(ctx.rootDir, 'CLAUDE.md'), content);

  // Cursor
  writeCursorRules(join(ctx.rootDir, '.cursor', 'rules', 'shipsite.mdc'), content);

  // GitHub Copilot
  writeWithPreservedContent(join(ctx.rootDir, '.github', 'copilot-instructions.md'), content);

  // Windsurf
  writeWithPreservedContent(join(ctx.rootDir, '.windsurf', 'rules', 'shipsite.md'), content);
}
