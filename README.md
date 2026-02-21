<p align="center">
  <img src="https://shipsite.dev/images/logo.svg" alt="ShipSite" width="64" height="64" />
</p>

<h1 align="center">ShipSite</h1>

<h3 align="center">The AI-native website generator</h3>

<p align="center">
  Ship marketing websites with JSON + MDX. Let AI do the rest.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@shipsite/cli"><img src="https://img.shields.io/npm/v/@shipsite/cli.svg" alt="npm version" /></a>
  <a href="https://github.com/shipsite/shipsite/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/shipsite/shipsite/stargazers"><img src="https://img.shields.io/github/stars/shipsite/shipsite.svg?style=social" alt="GitHub stars" /></a>
</p>

---

## Quick Start

```bash
npx create-shipsite my-website
cd my-website
npm install
npx shipsite dev
```

Your site is running at `http://localhost:3000`.

---

## Why ShipSite?

| | Feature | Description |
|---|---|---|
| **46+** | Components | Hero, Pricing, FAQ, Blog, Legal, Bento, Carousel — plus your own custom components |
| **1** | Config File | `shipsite.json` defines your entire site structure |
| **i18n** | Built-in | Multi-language with slug translation and hreflang |
| **SSG** | Static Generation | Every page is statically generated — zero runtime JS overhead |
| **Blog** | Full System | Blog index, articles, categories, authors, reading time |
| **AI** | Native | Structured format that AI agents can read, write, and automate |
| **SEO** | Automatic | Sitemap, robots.txt (AI-crawler-friendly), meta tags, hreflang — zero config |
| **CI** | Validate | `shipsite validate` checks content, SEO, components, and images |
| **N8N** | Automation | Connect Search Console, Google Ads, analytics — optimize on autopilot |

---

## AI-Native — The Differentiator

Traditional CMSes store content in databases, behind APIs, in proprietary formats. AI agents struggle to work with them.

ShipSite stores everything in **structured, human-readable files**:

- **`shipsite.json`** — one JSON config an AI can read and modify
- **MDX pages** — typed components with predictable props
- **`components.json`** — machine-readable reference of all 46 components with props, types, and examples
- **CLI automation** — `shipsite add page` / `shipsite add blog` for scripting

This makes ShipSite the **website generator that AI agents can operate**. Connect it to N8N, Windmill, or Make to build fully automated pipelines — from Google Search Console analysis to content generation to deployment.

### AI generates an MDX page

```mdx
---
title: "Why Teams Love ShipSite"
description: "Build marketing websites with JSON + MDX."
---

<Hero
  title="Why Teams Love ShipSite"
  description="One config file. 30+ components. Ship in minutes."
  primaryCta={{ label: "Get Started", href: "/signup" }}
/>

<Features title="Everything You Need" columns={3}>
  <Feature title="Fast" description="Static generation, instant loads." />
  <Feature title="Flexible" description="30+ typed components." />
  <Feature title="Global" description="Multi-language from day one." />
</Features>
```

AI agents can generate pages like this because every component has a **typed, documented interface**. No guessing, no visual editors, no proprietary APIs.

### Programmatic SEO — 50 city pages in one script

```js
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const cities = ['new-york', 'london', 'berlin', 'tokyo', 'sydney' /* ... */];
const config = JSON.parse(readFileSync('shipsite.json', 'utf-8'));

for (const city of cities) {
  const title = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Create MDX content
  mkdirSync(`content/${city}`, { recursive: true });
  writeFileSync(`content/${city}/en.mdx`, `---
title: "Best Project Management Tool in ${title}"
description: "Discover why teams in ${title} choose us."
---

<Hero
  title="The #1 Tool in ${title}"
  description="Join thousands of teams in ${title}."
  primaryCta={{ label: "Start Free", href: "/signup?city=${city}" }}
/>

<Features title="Why ${title} Teams Choose Us" columns={3}>
  <Feature title="Local Support" description="Dedicated support for ${title} teams." />
  <Feature title="Fast Setup" description="Get started in minutes." />
  <Feature title="Free Plan" description="No credit card required." />
</Features>
`);

  // Register in shipsite.json
  config.pages.push({
    slug: city,
    type: 'page',
    content: city,
    locales: ['en'],
  });
}

writeFileSync('shipsite.json', JSON.stringify(config, null, 2));
// Run: npx shipsite build → 50 static pages
```

### Automation workflows (N8N, Windmill, Make)

Since ShipSite is pure files, any workflow tool can operate it. Here are real-world automation scenarios:

**Blog generation pipeline:**
```
Trigger: New blog topic from Airtable / Google Sheet
   ↓
Step 1: AI generates MDX content (Claude, GPT, etc.)
   ↓
Step 2: Script writes .mdx file to content/blog/<slug>/en.mdx
   ↓
Step 3: Script adds entry to shipsite.json pages array
   ↓
Step 4: Git commit + push → Vercel auto-deploys
   ↓
Result: New blog post live in < 60 seconds
```

**SEO optimization loop (Google Search Console → AI → Deploy):**
```
Trigger: Weekly cron / N8N schedule
   ↓
Step 1: Pull Google Search Console API → pages with low CTR or declining impressions
   ↓
Step 2: AI agent reads the MDX file + components.json → understands the page structure
   ↓
Step 3: AI rewrites titles, descriptions, content for better rankings
   ↓
Step 4: Git commit + push → auto-deploy → measure results next week
   ↓
Result: Continuous SEO improvement without manual intervention
```

**Google Ads landing page generation:**
```
Trigger: New ad campaign created in Google Ads
   ↓
Step 1: Pull campaign keywords and ad copy from Google Ads API
   ↓
Step 2: AI generates targeted landing page MDX with matching Hero, Features, CTA
   ↓
Step 3: Register page in shipsite.json → deploy
   ↓
Result: Campaign-specific landing pages in seconds, not days
```

**Multi-language content pipeline:**
```
Trigger: New English blog post merged to main
   ↓
Step 1: AI translates MDX content to DE, FR (preserving all component props)
   ↓
Step 2: Writes translated files to content/blog/<slug>/de.mdx, fr.mdx
   ↓
Step 3: Updates locales array in shipsite.json
   ↓
Result: Multi-language blog post published simultaneously
```

### components.json — AI-readable component reference

ShipSite ships with a `components.json` that describes all 46 components — names, categories, props with types, and MDX examples. AI agents read this file to understand what's available and generate correct MDX on the first try:

```json
{
  "name": "Hero",
  "category": "marketing",
  "props": [
    { "name": "title", "type": "string", "required": true },
    { "name": "primaryCta", "type": "{ label: string; href: string }", "required": false },
    { "name": "badge", "type": "string", "required": false }
  ],
  "example": "<Hero title=\"...\" primaryCta={{ label: \"Get Started\", href: \"/signup\" }} />"
}
```

Feed this to any AI agent (Claude, GPT, Gemini) and it knows exactly what components exist and how to use them — no documentation parsing, no trial and error.

### AI modifies shipsite.json

An AI agent can update your site config directly:

```json
{
  "navigation": {
    "items": [
      { "label": "Features", "href": "/features" },
      { "label": "Pricing", "href": "/pricing" },
      { "label": "Blog", "href": "/blog" }
    ],
    "cta": { "label": "Get Started", "href": "/signup" }
  },
  "pages": [
    { "slug": "", "type": "landing", "content": "landing" },
    { "slug": "pricing", "type": "page", "content": "pricing" },
    { "slug": "blog", "type": "blog-index", "content": "blog" }
  ]
}
```

Add a page? Push an object to the `pages` array. Change the CTA? Update one string. No API calls, no database migrations, no CMS login.

---

## How It Works

```
shipsite.json          content/              @shipsite/components
┌──────────────┐      ┌──────────────────┐   ┌──────────────────┐
│ name          │      │ landing/en.mdx   │   │ Hero             │
│ colors        │      │ pricing/en.mdx   │   │ Features         │
│ navigation    │  +   │ blog/en.mdx      │ + │ PricingSection   │
│ footer        │      │ blog/post/en.mdx │   │ FAQ              │
│ pages[]       │      │ privacy/en.mdx   │   │ BannerCTA        │
│ i18n          │      │ ...              │   │ 30+ more...      │
└──────┬───────┘      └────────┬─────────┘   └────────┬─────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               │
                     ┌─────────▼─────────┐
                     │  shipsite build   │
                     │  (Next.js SSG)    │
                     └─────────┬─────────┘
                               │
                     ┌─────────▼─────────┐
                     │  Static HTML/CSS  │
                     │  Ready to deploy  │
                     └───────────────────┘
```

---

## Components

### Marketing

| Component | Description | Key Props |
|---|---|---|
| `Hero` | Full-width hero section with CTAs | `title`, `description`, `primaryCta`, `secondaryCta`, `badge`, `image` |
| `PageHero` | Simpler page header | `title`, `description`, `badge` |
| `Features` | Feature grid (2/3/4 columns) | `title`, `description`, `columns`, children: `<Feature>` |
| `Feature` | Individual feature card | `title`, `description`, `icon` |
| `AlternatingFeatures` | Two-column alternating rows | `title`, children: `<AlternatingFeatureRow>` |
| `AlternatingFeatureRow` | Single feature row with image | `title`, `image`, `description`, children: `<AlternatingFeatureItem>` |
| `AlternatingFeatureItem` | Bullet inside a row | `title`, `description`, `icon` |
| `PricingSection` | Pricing table with toggle | `title`, `description`, children: `<PricingPlan>` |
| `PricingPlan` | Individual pricing tier | `name`, `price`, `yearlyPrice`, `features`, `cta`, `popular` |
| `ComparisonRow` | Feature comparison row | `feature`, `values` |
| `ComparisonCategory` | Category header in comparison | `title` |
| `Companies` | Logo marquee | `logos`, `title` |
| `Testimonial` | Customer quote | `quote`, `author`, `role`, `image`, `company` |
| `BannerCTA` | Full-width CTA banner | `title`, `buttonText`, `buttonHref`, `subtext` |
| `BannerFeature` | Trust badge inside BannerCTA | `title`, `icon` |
| `FAQ` | Accordion FAQ section | `title`, children: `<FAQItem>` |
| `FAQItem` | Single FAQ entry | `question`, children (answer) |
| `Steps` | Numbered steps section | `title`, children: `<Step>` |
| `Step` | Individual step | `title`, `description` |
| `CardGrid` | Clickable card grid | `columns`, children: `<CardGridItem>` |
| `CardGridItem` | Individual card | `title`, `description`, `icon`, `href` |
| `CalloutCard` | Highlighted callout | `title`, `description`, `variant` |

### Blog

| Component | Description | Key Props |
|---|---|---|
| `BlogArticle` | Article wrapper | children |
| `BlogIndex` | Blog listing page | `title`, `description` |
| `BlogIntro` | Lead paragraph | children |
| `BlogCTA` | Inline CTA button | `title`, `buttonText`, `buttonHref` |
| `BlogCTABanner` | Full-width blog CTA | `title`, `description`, `buttonText`, `buttonLink` |
| `BlogFAQ` | FAQ accordion (data-driven) | `title`, `items` |
| `BlogTable` | Data table | `headers`, `rows` |
| `BlogTip` | Tip callout box | `title`, children |
| `StartFreeNowCTA` | CTA with bullet points | `title`, `bullets`, `buttonText`, `buttonHref` |

### Legal

| Component | Description | Key Props |
|---|---|---|
| `LegalPage` | Legal page wrapper | `title`, `lastUpdated`, children: `<LegalSection>` |
| `LegalSection` | Legal content section | `title`, children |

---

## shipsite.json — Full Example

```json
{
  "$schema": "https://schema.shipsite.dev/v1.json",
  "name": "My SaaS",
  "url": "https://mysaas.com",
  "logo": "/images/logo.svg",
  "favicon": "/favicon.png",
  "ogImage": "/images/og-image.jpg",

  "colors": {
    "primary": "#5d5bd4",
    "accent": "#067647",
    "background": "#ffffff",
    "text": "#1f2a37"
  },

  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },

  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "de", "fr"],
    "localePrefix": "as-needed"
  },

  "navigation": {
    "items": [
      { "label": "Features", "href": "/features" },
      { "label": "Pricing", "href": "/pricing" },
      { "label": "Blog", "href": "/blog" }
    ],
    "cta": { "label": "Get Started", "href": "https://app.mysaas.com/signup" }
  },

  "footer": {
    "columns": [
      {
        "title": "Product",
        "links": [
          { "label": "Features", "href": "/features" },
          { "label": "Pricing", "href": "/pricing" }
        ]
      },
      {
        "title": "Legal",
        "links": [
          { "label": "Privacy Policy", "href": "/privacy" },
          { "label": "Terms of Service", "href": "/terms" }
        ]
      }
    ],
    "copyright": "© 2026 My SaaS"
  },

  "pages": [
    { "slug": "", "type": "landing", "content": "landing", "locales": ["en", "de", "fr"] },
    { "slug": "pricing", "type": "page", "content": "pricing", "locales": ["en"] },
    { "slug": "blog", "type": "blog-index", "content": "blog", "locales": ["en"] },
    { "slug": "blog/getting-started", "type": "blog-article", "content": "blog/getting-started", "locales": ["en"] },
    { "slug": "privacy", "type": "legal", "content": "privacy", "locales": ["en"] },
    { "slug": "terms", "type": "legal", "content": "terms", "locales": ["en"] }
  ],

  "blog": {
    "authors": {
      "default": {
        "name": "Team",
        "role": "Author",
        "image": "/images/team.avif"
      }
    }
  },

  "analytics": {
    "googleTagManager": "GTM-XXXXXXX"
  }
}
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, static generation |
| [Content Collections](https://www.content-collections.dev) | MDX processing with type safety |
| [next-intl v4](https://next-intl.dev) | i18n with locale prefix and slug translation |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Zod](https://zod.dev) | Config schema validation |
| [TypeScript](https://www.typescriptlang.org) | End-to-end type safety |

---

## SEO — Automatic sitemap.xml and robots.txt

ShipSite generates `sitemap.xml` and `robots.txt` automatically from your `shipsite.json` — zero configuration required.

### sitemap.xml

Generated at build time with:

- **All pages** from `shipsite.json` pages array
- **Priority** per page type (landing: 1.0, product: 0.9, blog-index: 0.8, blog-article: 0.7, legal: 0.3)
- **Change frequency** per type (landing: weekly, blog-index: daily, blog-article: monthly, legal: yearly)
- **hreflang alternates** for multi-language pages (`x-default` + all locales)
- **Last modified** from blog article dates

### robots.txt

Generated with rules that **explicitly allow AI crawlers**:

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: GoogleOther
Allow: /

Sitemap: https://yoursite.com/sitemap.xml
```

Most websites block AI crawlers by default. ShipSite does the opposite — since your site is structured for AI consumption, the robots.txt explicitly welcomes AI agents. This means your content appears in AI-powered search results (ChatGPT, Perplexity, Claude) and AI assistants can reference your pages.

---

## Deploy

ShipSite generates a standard Next.js site. Deploy to any platform that supports Next.js or static hosting.

### Option A: Vercel (recommended)

Vercel is the company behind Next.js — zero-config deployment with automatic previews, edge network, and analytics.

**1. Push your project to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create my-website --public --push
```

**2. Connect to Vercel**

```bash
npm i -g vercel
vercel
```

Or go to [vercel.com/new](https://vercel.com/new), import your GitHub repo, and configure:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `.` (or `docs` if your site lives in a subfolder) |
| Build Command | `npx shipsite build` |
| Output Directory | `.shipsite/.next` |
| Install Command | `npm install` |

**3. Deploy**

Every `git push` triggers an automatic deployment. Preview deployments are created for every pull request.

```bash
# Manual deploy
vercel --prod

# Environment variables (if needed)
vercel env add SHIPSITE_ROOT
```

**What you get with Vercel:**
- Automatic HTTPS and CDN
- Preview deployments for every PR
- Serverless functions (if you extend beyond static)
- Web analytics and speed insights
- Custom domains with one click

---

### Option B: Cloudflare Pages

Cloudflare Pages offers fast global edge hosting with generous free tier (unlimited bandwidth, 500 builds/month).

**1. Push your project to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create my-website --public --push
```

**2. Add static export to your Next.js config**

Cloudflare Pages serves static files only. Add `output: 'export'` to the generated Next.js config. Create a `shipsite.config.mjs` in your project root:

```js
// shipsite.config.mjs — Cloudflare Pages requires static export
/** @type {import('next').NextConfig} */
export const nextConfigOverrides = {
  output: 'export',
  images: { unoptimized: true },
};
```

Or manually edit `.shipsite/next.config.ts` after running `npx shipsite dev` once:

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',           // ← add this
  images: { unoptimized: true }, // ← add this
};
```

**3. Connect to Cloudflare Pages**

Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Connect to Git:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npx shipsite build` |
| Build output directory | `.shipsite/.next/out` |
| Root directory | `.` (or `docs` if subfolder) |
| Node.js version | `20` (set in Environment Variables: `NODE_VERSION` = `20`) |

**4. Deploy**

```bash
git push origin main
# Cloudflare Pages builds and deploys automatically
```

Or use the Wrangler CLI for manual deploys:

```bash
npm i -g wrangler
npx shipsite build
wrangler pages deploy .shipsite/.next/out --project-name=my-website
```

**What you get with Cloudflare Pages:**
- Unlimited bandwidth on free tier
- 500 builds/month (free), unlimited on paid
- Global edge network (300+ cities)
- Custom domains and automatic HTTPS
- Cloudflare Web Analytics (privacy-friendly)

---

### Option C: Netlify

| Setting | Value |
|---|---|
| Build command | `npx shipsite build` |
| Publish directory | `.shipsite/.next/out` |
| Node version | `20` (set `NODE_VERSION=20` in env) |

Same as Cloudflare — add `output: 'export'` and `images: { unoptimized: true }` to your Next.js config for static export.

---

### Option D: Self-host (Docker, VPS, S3)

```bash
npx shipsite build

# The static output is in .shipsite/.next (or .shipsite/.next/out with export mode)
# Serve with any static file server:

# nginx
cp -r .shipsite/.next/out /var/www/my-website

# Python (quick test)
cd .shipsite/.next/out && python3 -m http.server 8080

# Docker (nginx)
FROM nginx:alpine
COPY .shipsite/.next/out /usr/share/nginx/html
```

---

## CLI Reference

```bash
npx shipsite dev          # Start dev server
npx shipsite build        # Generate static site
npx shipsite validate     # Validate content, SEO, and component integrity
npx shipsite add page X   # Scaffold a new page + register in shipsite.json
npx shipsite add blog "Y" # Scaffold a blog post + register in shipsite.json
```

### `shipsite validate`

Runs content and SEO validation across your entire site:

- **Frontmatter** — title and description present in every page
- **SEO** — title length (30-70 chars), description length (70-160 chars), duplicate detection, keyword stuffing
- **Components** — required components per page type (Hero for landing, BlogArticle for blog posts, etc.)
- **Blog** — author exists in shipsite.json, date format (YYYY-MM-DD), minimum word count (300), heading structure
- **Orphan detection** — content folders not referenced in shipsite.json
- **Image validation** — referenced images exist in public/

Use it in CI to catch issues before deployment:

```yaml
- name: Validate content
  run: npx shipsite validate
```

---

## Custom Next.js Config

Every ShipSite project includes a `next.config.ts` in the project root. Add redirects, rewrites, headers, or any other Next.js configuration:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  redirects: async () => [
    { source: '/old-page', destination: '/new-page', permanent: true },
  ],
  headers: async () => [
    { source: '/(.*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] },
  ],
};

export default config;
```

ShipSite automatically merges your config with its own at build time.

---

## Custom Components

Add your own React components and use them in MDX — alongside the 46 built-in ones:

**1. Create a component:**

```tsx
// components/Highlight.tsx
export function Highlight({ color, children }: { color: string; children: React.ReactNode }) {
  return <span style={{ backgroundColor: color, padding: '2px 8px', borderRadius: 4 }}>{children}</span>;
}
```

**2. Export it:**

```ts
// components/index.ts
export { Highlight } from './Highlight';
```

**3. Use it in any MDX file:**

```mdx
This is <Highlight color="#fef3c7">important</Highlight> text.
```

ShipSite automatically merges your custom components with the built-in ones. AI agents can create new components by writing `.tsx` files to `components/` and adding the export to `index.ts`.

---

## Project Structure

```
my-website/
├── shipsite.json          # Site configuration
├── next.config.ts         # Custom Next.js config (redirects, headers, etc.)
├── components/            # Custom React components (auto-merged with built-in)
│   └── index.ts           # Barrel export
├── content/
│   ├── landing/
│   │   └── en.mdx         # Landing page
│   ├── pricing/
│   │   └── en.mdx         # Pricing page
│   ├── blog/
│   │   ├── en.mdx         # Blog index
│   │   └── my-post/
│   │       └── en.mdx     # Blog article
│   ├── privacy/
│   │   └── en.mdx         # Privacy policy
│   └── terms/
│       └── en.mdx         # Terms of service
├── public/
│   └── images/
└── package.json
```

---

## Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Run tests: `npm run build`
5. Submit a pull request

---

## Company

ShipSite is built and maintained by **MPH GL GmbH**, headquartered in Zug, Switzerland.

## License

MIT — see [LICENSE](./LICENSE) for details.
