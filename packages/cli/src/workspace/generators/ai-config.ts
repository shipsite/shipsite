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

## Navigation (shipsite.json)

Navigation is configured in \`shipsite.json\` under \`navigation\`. Items can be simple links or dropdown submenus with optional featured items.

\\\`\\\`\\\`json
{
  "navigation": {
    "items": [
      { "label": "Pricing", "href": "/pricing" },
      {
        "label": "Products",
        "children": [
          { "label": "Analytics", "href": "/analytics", "description": "Track your metrics" },
          { "label": "Automation", "href": "/automation", "description": "Automate workflows" }
        ],
        "featured": {
          "title": "New: AI Assistant",
          "description": "Meet our latest product.",
          "href": "/ai",
          "image": "/images/ai-preview.png"
        }
      }
    ],
    "cta": { "label": "Get Started", "href": "/signup" }
  }
}
\\\`\\\`\\\`

**Navigation item types:**
- **Link:** \`{ label, href }\` — simple nav link
- **Submenu:** \`{ label, children, featured? }\` — dropdown with child links. Each child has \`label\`, \`href\`, and optional \`description\`. The optional \`featured\` object adds a highlighted card with image.
- **CTA:** optional \`cta\` button shown at the right end of the navigation bar

All text fields (\`label\`, \`description\`, \`title\`) accept \`string\` or \`{ locale: "text" }\` for i18n.

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
6. **Use straight quotes only** — curly/typographic quotes (\u201C \u201D \u2018 \u2019) break MDX parsing. Always use straight quotes (" ').
7. **Anchor links** — all section-level components accept an optional \`id\` prop for anchor navigation (e.g. \`<FAQ id="faq">\` enables \`#faq\` links). Do not wrap components in extra \`<div id="...">\` elements.
8. **Match the existing language** — when editing or adding content (labels, descriptions, placeholders, options), always match the language already used in that file. If the form labels are in German, new fields must also be in German. Never mix languages within a file.
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

function buildSkillContent(components: ComponentsJson | null): string {
  const componentCatalog = components ? formatComponentCatalog(components.components) : '_Components not found — run `npm install` first._';

  return `---
name: shipsite
description: Build and edit ShipSite marketing websites. Use when working with shipsite.json configuration, MDX content files, or ShipSite components like Hero, Features, PricingSection, ContactForm, etc.
license: MIT
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Glob
  - Grep
---

# ShipSite — Project Guide

## Tech Stack

- **Framework:** Next.js (App Router)
- **Content:** MDX files in \`content/\` — processed by content-collections
- **Styling:** Tailwind CSS v4 + shadcn/ui design tokens
- **i18n:** next-intl (configure locales in \`shipsite.json\` under \`i18n\`)
- **Components:** \`@shipsite.dev/components\` — pre-built marketing, blog & legal components
- **CLI:** \`npx shipsite\` — scaffold pages, blog posts, and manage the workspace

## Project Structure

\`\`\`
shipsite.json          # Site configuration (pages, nav, footer, colors, fonts, i18n)
                       # Navigation & footer labels accept string | { locale: "text" } for i18n
content/               # MDX content files, one folder per page
  {page-name}/
    {locale}.mdx       # Content file per locale
components/            # Custom components (auto-available in MDX)
public/                # Static assets (images, fonts, favicons)
.shipsite/             # Generated workspace (do NOT edit)
\`\`\`

## shipsite.json Schema

The main configuration file controls site metadata, pages, navigation, footer, colors, fonts, socials, and i18n.

\\\`\\\`\\\`json
{
  "name": "My Site",
  "i18n": {
    "locales": ["en", "de"],
    "defaultLocale": "en"
  },
  "pages": [
    { "name": "landing", "type": "landing", "path": "/" },
    { "name": "pricing", "type": "page", "path": "/pricing" },
    { "name": "blog", "type": "blog-index", "path": "/blog" },
    { "name": "blog-article", "type": "blog-article", "path": "/blog/:slug" },
    { "name": "privacy", "type": "legal", "path": "/privacy" }
  ],
  "navigation": {
    "items": [
      { "label": "Pricing", "href": "/pricing" },
      {
        "label": "Products",
        "children": [
          { "label": "Analytics", "href": "/analytics", "description": "Track your metrics" },
          { "label": "Automation", "href": "/automation", "description": "Automate workflows" }
        ],
        "featured": {
          "title": "New: AI Assistant",
          "description": "Meet our latest product.",
          "href": "/ai",
          "image": "/images/ai-preview.png"
        }
      }
    ],
    "cta": { "label": "Get Started", "href": "/signup" }
  },
  "footer": {
    "columns": [
      {
        "title": "Product",
        "links": [
          { "label": "Features", "href": "/features" },
          { "label": "Pricing", "href": "/pricing" }
        ]
      }
    ],
    "bottom": [
      { "label": "Privacy", "href": "/privacy" },
      { "label": "Terms", "href": "/terms" }
    ]
  },
  "colors": {
    "primary": "#6d28d9"
  },
  "fonts": {
    "heading": "Cal Sans",
    "body": "Inter"
  },
  "socials": {
    "twitter": "https://twitter.com/example",
    "github": "https://github.com/example"
  }
}
\\\`\\\`\\\`

**Navigation item types:**
- **Link:** \`{ label, href }\` — simple nav link
- **Submenu:** \`{ label, children, featured? }\` — dropdown with child links. Each child has \`label\`, \`href\`, and optional \`description\`. The optional \`featured\` object adds a highlighted card with image.
- **CTA:** optional \`cta\` button shown at the right end of the navigation bar

All text fields (\`label\`, \`description\`, \`title\`) accept \`string\` or \`{ locale: "text" }\` for i18n.

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

## CLI Commands

\`\`\`bash
# Add a new page
npx shipsite add page

# Add a blog (index + article page)
npx shipsite add blog

# Regenerate workspace after shipsite.json changes
npx shipsite generate
\`\`\`

## Custom Components

Create custom components in \`components/\` to extend MDX:

\`\`\`
components/
  MyWidget.tsx       # Auto-available as <MyWidget /> in MDX
  PriceCalculator.tsx
\`\`\`

Custom components are automatically registered and available in all MDX files without imports.

## Key Rules

1. **Never edit files inside \`.shipsite/\`** — they are auto-generated and will be overwritten.
2. **Don't import ShipSite components** — they are globally registered in MDX.
3. **Page structure is defined in \`shipsite.json\`** — to add a page, add an entry to the \`pages\` array and create the content folder.
4. **One MDX file per locale per page** — e.g. \`content/landing/en.mdx\`, \`content/landing/de.mdx\`.
5. **Use the component catalog above** to pick the right component for each section.
6. **Use straight quotes only** — curly/typographic quotes (\u201C \u201D \u2018 \u2019) break MDX parsing. Always use straight quotes (" ').
7. **Anchor links** — all section-level components accept an optional \`id\` prop for anchor navigation (e.g. \`<FAQ id="faq">\` enables \`#faq\` links). Do not wrap components in extra \`<div id="...">\` elements.
8. **Match the existing language** — when editing or adding content (labels, descriptions, placeholders, options), always match the language already used in that file. If the form labels are in German, new fields must also be in German. Never mix languages within a file.
`;
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

  // Skills (installed into each agent's skill directory)
  const skillContent = buildSkillContent(components);
  for (const skillDir of [
    join(ctx.rootDir, '.claude', 'skills', 'shipsite'),
    join(ctx.rootDir, '.cursor', 'skills', 'shipsite'),
  ]) {
    if (!existsSync(skillDir)) {
      mkdirSync(skillDir, { recursive: true });
    }
    writeFileSync(join(skillDir, 'SKILL.md'), skillContent);
  }
}
