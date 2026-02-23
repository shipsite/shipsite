<p align="center">
  <img src="https://shipsite.dev/images/logo.svg" alt="ShipSite" width="80" height="80" />
</p>

<h1 align="center">ShipSite</h1>

<h3 align="center">Marketing websites that update themselves.</h3>

<p align="center">
  CLI + structured MDX + OpenClaw ChatOps.<br>
  Blazing fast. 100/100 Lighthouse. Fully automatable.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@shipsite.dev/cli"><img src="https://img.shields.io/npm/v/@shipsite.dev/cli.svg" alt="npm version" /></a>
  <a href="https://github.com/shipsite/shipsite/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/shipsite/shipsite/stargazers"><img src="https://img.shields.io/github/stars/shipsite/shipsite.svg?style=social" alt="GitHub stars" /></a>
  <img src="https://img.shields.io/badge/Lighthouse-100%2F100-brightgreen" alt="100/100 Lighthouse" />
</p>

---

## Quick Start (60 seconds)

```bash
npx create-shipsite@latest my-website
cd my-website
npm install
npx shipsite dev
```

Your site is running at `http://localhost:3000`.

**[Live Demo](https://shipsite.dev) · [Docs](https://shipsite.dev/docs)**

---

## Why ShipSite?

| Feature                    | Benefit                                           |
|----------------------------|---------------------------------------------------|
| **46+ ready-made blocks**  | Hero, Pricing, FAQ, Blog, Legal, Bento… ready to use |
| **Single Source of Truth** | One `shipsite.json` controls your entire site     |
| **100/100 Lighthouse**     | Statically generated — extremely fast by default  |
| **Built-in multilingual**  | Automatic language paths + hreflang               |
| **Full blog system**       | Authors, categories, reading time, RSS            |
| **Automatic SEO**          | Sitemap, robots.txt (AI-crawler friendly), meta, Open Graph |
| **shipsite validate**      | Quality check before every deploy                 |
| **OpenClaw ChatOps**       | Control your website via chat (Telegram, Slack, Discord…) |

---

## OpenClaw ChatOps – Your website listens to chat

The real game-changer.

Just write in Telegram, Slack, WhatsApp or Discord:

> “Hey OpenClaw, create a new landing page for Berlin with current pricing and deploy it.”

→ OpenClaw creates the MDX file, adds it to `shipsite.json`, commits and opens a PR — fully automatic.

**Perfect for:**
- Marketing teams without technical knowledge
- Continuous SEO optimization
- Local campaigns (50 city pages)
- Fast price or feature updates

---

## How it works

```
shipsite.json          content/             @shipsite/components
   ↓                       ↓                        ↓
Single Source of Truth + structured MDX + 46 ready components
   ↓
          shipsite build (Next.js 16 SSG)
   ↓
     Static HTML/CSS → 100/100 Lighthouse
```

Every change is Git-versioned, reviewable and rollback-safe — even when an AI bot made it.

---

## Typical use cases

**Startup website**  
Landing page + features + pricing + blog in under 3 hours.

**Programmatic SEO**  
Generate 50 city landing pages with one small script.

**Multilingual expansion**  
German, English, Spanish — fully automatic sync.

**Chat-controlled website**  
“Hey OpenClaw, increase all prices by 10 %” → live in minutes.

---

## Technical overview

- **Next.js 16** (App Router + Static Generation)
- **Content Collections** + full type safety
- **Tailwind CSS 4**
- **Zod**-validated `shipsite.json`
- Fully extensible with your own React components

---

## shipsite.json – Example

```json
{
  "$schema": "https://schema.shipsite.dev/v1.json",
  "name": "My SaaS",
  "url": "https://mysaas.com",
  "i18n": { "defaultLocale": "en", "locales": ["en", "de"] },
  "navigation": { ... },
  "pages": [
    { "slug": "", "type": "landing", "content": "landing", "locales": ["en", "de"] },
    { "slug": "blog", "type": "blog-index", "content": "blog" }
  ]
}
```

---

## Deploy (one click)

- **Vercel** (recommended)
- **Cloudflare Pages**
- **Netlify**
- Self-hosting (static export possible)

---

## CLI commands

```bash
npx shipsite dev          # Development
npx shipsite build        # Production build
npx shipsite validate     # Quality check
npx shipsite add page     # New page
npx shipsite add blog     # New blog post
```

---

## Open Source & Community

ShipSite is **100 % open source (MIT)** and actively developed.

- [GitHub Discussions](https://github.com/shipsite/shipsite/discussions)

---

**Built for humans & AI agents.**

---

## License

MIT — see [LICENSE](./LICENSE)
