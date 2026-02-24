#!/usr/bin/env node

import * as p from '@clack/prompts';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';
import { deflateSync } from 'zlib';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

// --- Minimal PNG generator (zero dependencies) ---

const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])), 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

/** Generate a solid-color square PNG (RGB, no alpha). */
function generatePng(size: number, hex: string): Buffer {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rowBytes = 1 + size * 3;
  const raw = Buffer.alloc(rowBytes * size);
  for (let y = 0; y < size; y++) {
    const off = y * rowBytes;
    raw[off] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const px = off + 1 + x * 3;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Default label translations ───────────────────────────────
const translations: Record<string, Record<string, string>> = {
  Features:         { en: 'Features',         de: 'Funktionen',          fr: 'Fonctionnalités',       es: 'Características' },
  Pricing:          { en: 'Pricing',          de: 'Preise',              fr: 'Tarifs',                es: 'Precios' },
  Blog:             { en: 'Blog',             de: 'Blog',                fr: 'Blog',                  es: 'Blog' },
  'Get Started':    { en: 'Get Started',      de: 'Loslegen',            fr: 'Commencer',             es: 'Comenzar' },
  Product:          { en: 'Product',          de: 'Produkt',             fr: 'Produit',               es: 'Producto' },
  Legal:            { en: 'Legal',            de: 'Rechtliches',         fr: 'Mentions légales',      es: 'Legal' },
  'Privacy Policy': { en: 'Privacy Policy',   de: 'Datenschutz',         fr: 'Politique de confidentialité', es: 'Política de privacidad' },
  'Terms of Service': { en: 'Terms of Service', de: 'Nutzungsbedingungen', fr: 'Conditions d\'utilisation', es: 'Términos de servicio' },
};

/**
 * Build a localized label for shipsite.json.
 * Returns a plain string when only one locale is selected,
 * or a `{ en: "...", de: "..." }` map for multiple locales.
 */
function localizedLabel(
  key: string,
  locales: string[],
): string | Record<string, string> {
  if (locales.length <= 1) {
    const locale = locales[0] || 'en';
    return translations[key]?.[locale] || key;
  }
  const map: Record<string, string> = {};
  for (const locale of locales) {
    map[locale] = translations[key]?.[locale] || key;
  }
  return map;
}

async function main() {
  console.log();
  p.intro(`Create a new ShipSite project (v${version})`);

  const projectName = (await p.text({
    message: 'Project name',
    placeholder: 'my-website',
    validate: (value) => {
      if (!value) return 'Project name is required';
      if (existsSync(resolve(value))) return 'Directory already exists';
    },
  })) as string;

  if (p.isCancel(projectName)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  const primaryColor = (await p.text({
    message: 'Primary color (hex)',
    placeholder: '#5d5bd4',
    initialValue: '#5d5bd4',
  })) as string;

  if (p.isCancel(primaryColor)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  const localesResult = (await p.multiselect({
    message: 'Which languages do you need?',
    options: [
      { value: 'en', label: 'English', hint: 'default' },
      { value: 'de', label: 'German' },
      { value: 'fr', label: 'French' },
      { value: 'es', label: 'Spanish' },
    ],
    required: true,
    initialValues: ['en'],
  })) as string[];

  if (p.isCancel(localesResult)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  const locales = localesResult;
  const defaultLocale = locales[0] || 'en';

  const s = p.spinner();
  s.start('Creating project...');

  const projectDir = resolve(projectName);
  mkdirSync(projectDir, { recursive: true });

  // shipsite.json
  const config = {
    $schema: './node_modules/@shipsite.dev/core/shipsite.schema.json',
    name: projectName,
    url: `https://${projectName}.com`,
    logo: '/images/logo.svg',
    favicon: '/favicon.png',
    ogImage: '/images/og-image.jpg',
    colors: {
      primary: primaryColor,
      accent: '#067647',
      background: '#ffffff',
      text: '#1f2a37',
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    i18n: {
      defaultLocale,
      locales,
      localePrefix: 'as-needed' as const,
    },
    navigation: {
      items: [
        { label: localizedLabel('Features', locales), href: '/features' },
        { label: localizedLabel('Pricing', locales), href: '/pricing' },
        { label: localizedLabel('Blog', locales), href: '/blog' },
      ],
      cta: {
        label: localizedLabel('Get Started', locales),
        href: `https://app.${projectName}.com/signup`,
      },
    },
    footer: {
      columns: [
        {
          title: localizedLabel('Product', locales),
          links: [
            { label: localizedLabel('Features', locales), href: '/features' },
            { label: localizedLabel('Pricing', locales), href: '/pricing' },
          ],
        },
        {
          title: localizedLabel('Legal', locales),
          links: [
            { label: localizedLabel('Privacy Policy', locales), href: '/privacy' },
            { label: localizedLabel('Terms of Service', locales), href: '/terms' },
          ],
        },
      ],
      copyright: `\u00A9 ${new Date().getFullYear()} ${projectName}`,
    },
    pages: [
      { slug: '', type: 'landing', content: 'landing', locales },
      {
        slug: 'pricing',
        type: 'page',
        content: 'pricing',
        locales: [defaultLocale],
      },
      {
        slug: 'blog',
        type: 'blog-index',
        content: 'blog',
        locales: [defaultLocale],
      },
      {
        slug: 'blog/getting-started',
        type: 'blog-article',
        content: 'blog/getting-started',
        locales: [defaultLocale],
      },
      {
        slug: 'privacy',
        type: 'legal',
        content: 'privacy',
        locales: [defaultLocale],
      },
      {
        slug: 'terms',
        type: 'legal',
        content: 'terms',
        locales: [defaultLocale],
      },
    ],
    blog: {
      authors: {
        default: {
          name: 'Team',
          role: 'Author',
          image: '/images/team.avif',
        },
      },
    },
  };

  writeFileSync(
    join(projectDir, 'shipsite.json'),
    JSON.stringify(config, null, 2) + '\n',
  );

  // Content directories and files
  const dirs = [
    'landing',
    'pricing',
    'blog',
    'blog/getting-started',
    'privacy',
    'terms',
  ];
  for (const dir of dirs) {
    mkdirSync(join(projectDir, 'content', dir), { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];

  // Landing page
  writeFileSync(
    join(projectDir, 'content', 'landing', 'en.mdx'),
    `---
title: "${projectName} \u2014 Build Something Amazing"
description: "The best way to build your next great product."
---

<Hero
  title="Build Something Amazing"
  description="The fastest way to launch your product. Simple, powerful, and ready to go."
  primaryCta={{ label: "Get Started Free", href: "https://app.${projectName}.com/signup" }}
  secondaryCta={{ label: "Learn More", href: "/features" }}
/>

<Features title="Everything You Need" columns={3}>
  <Feature title="Fast Setup" description="Get started in minutes, not days. Our intuitive setup process gets you up and running quickly." />
  <Feature title="Powerful Features" description="All the tools you need to succeed, built right in. No plugins or extensions needed." />
  <Feature title="Great Support" description="Our team is here to help you every step of the way with world-class support." />
</Features>

<BannerCTA
  title="Ready to get started?"
  buttonText="Start Free Trial"
  buttonHref="https://app.${projectName}.com/signup"
  subtext="No credit card required. Free plan available."
/>

<FAQ title="Frequently Asked Questions">
  <FAQItem question="Is there a free plan?">
    Yes! We offer a generous free plan that includes all core features.
  </FAQItem>
  <FAQItem question="Can I cancel anytime?">
    Absolutely. No long-term contracts or cancellation fees.
  </FAQItem>
  <FAQItem question="Do you offer support?">
    Yes, we provide email support on all plans and priority support on paid plans.
  </FAQItem>
</FAQ>
`,
  );

  // Pricing
  writeFileSync(
    join(projectDir, 'content', 'pricing', 'en.mdx'),
    `---
title: "Pricing \u2014 ${projectName}"
description: "Simple, transparent pricing for teams of all sizes."
---

<PricingSection title="Simple Pricing" description="Choose the plan that works for you.">
  <PricingPlan name="Free" price="$0" description="For individuals getting started" features={["Up to 5 users", "Core features", "Community support"]} cta={{ label: "Get Started", href: "https://app.${projectName}.com/signup" }} />
  <PricingPlan name="Pro" price="$29/mo" yearlyPrice="$24/mo" description="For growing teams" features={["Unlimited users", "All features", "Priority support", "Custom integrations"]} cta={{ label: "Start Free Trial", href: "https://app.${projectName}.com/signup?plan=pro" }} popular={true} />
  <PricingPlan name="Enterprise" price="Custom" description="For large organizations" features={["Everything in Pro", "Dedicated support", "SLA", "Custom contracts"]} cta={{ label: "Contact Sales", href: "mailto:sales@${projectName}.com" }} />
</PricingSection>
`,
  );

  // Blog index
  writeFileSync(
    join(projectDir, 'content', 'blog', 'en.mdx'),
    `---
title: "Blog \u2014 ${projectName}"
description: "Latest news, updates, and insights."
---

<BlogIndex title="Our Blog" description="Latest news, updates, and insights from our team." />
`,
  );

  // Blog post
  writeFileSync(
    join(projectDir, 'content', 'blog', 'getting-started', 'en.mdx'),
    `---
title: "Getting Started with ${projectName}"
description: "Learn how to set up and start using ${projectName} in minutes."
excerpt: "Welcome to ${projectName}! In this guide, we'll walk you through everything you need to know to get started."
date: "${today}"
readingTime: 3
author: default
---

<BlogArticle>

## Step 1: Create Your Account

Sign up for a free account at [app.${projectName}.com](https://app.${projectName}.com/signup). No credit card required.

## Step 2: Configure Your Settings

Once you're in, head to Settings to customize your workspace. You can invite team members, set up integrations, and more.

## Step 3: Start Building

You're all set! Start exploring the features and building something great.

</BlogArticle>
`,
  );

  // Privacy
  writeFileSync(
    join(projectDir, 'content', 'privacy', 'en.mdx'),
    `---
title: "Privacy Policy"
description: "How we handle your data."
---

<ContentPage title="Privacy Policy" lastUpdated="${today}">
  <ContentSection title="1. Data Collection">We collect only the data necessary to provide our services.</ContentSection>
  <ContentSection title="2. Data Usage">Your data is used solely to deliver and improve our services.</ContentSection>
  <ContentSection title="3. Contact">For privacy-related inquiries, contact us at privacy@${projectName}.com.</ContentSection>
</ContentPage>
`,
  );

  // Terms
  writeFileSync(
    join(projectDir, 'content', 'terms', 'en.mdx'),
    `---
title: "Terms of Service"
description: "Terms and conditions for using our service."
---

<ContentPage title="Terms of Service" lastUpdated="${today}">
  <ContentSection title="1. Acceptance of Terms">By using our service, you agree to these terms.</ContentSection>
  <ContentSection title="2. Use of Service">You may use our service for lawful purposes only.</ContentSection>
  <ContentSection title="3. Termination">We reserve the right to terminate accounts that violate these terms.</ContentSection>
</ContentPage>
`,
  );

  // Public directory
  mkdirSync(join(projectDir, 'public', 'images'), { recursive: true });

  writeFileSync(
    join(projectDir, 'public', 'images', 'logo.svg'),
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="${primaryColor}"/>
  <text x="16" y="22" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="system-ui">${projectName.charAt(0).toUpperCase()}</text>
</svg>`,
  );

  // Default favicon and apple-touch-icon (solid primary color — swap with your real icons)
  writeFileSync(join(projectDir, 'public', 'favicon.png'), generatePng(32, primaryColor));
  writeFileSync(join(projectDir, 'public', 'apple-touch-icon.png'), generatePng(180, primaryColor));

  // Custom components directory
  mkdirSync(join(projectDir, 'components'), { recursive: true });

  writeFileSync(
    join(projectDir, 'components', 'index.ts'),
    `// Custom components — export your components here to use them in MDX.
// ShipSite automatically merges these with the built-in components.
//
// Example:
//   export { Highlight } from './Highlight';
//
// Then use in any MDX file:
//   <Highlight color="blue">Important text</Highlight>

export {};
`,
  );

  // next.config.ts — always present so AI agents and developers know where to add redirects, headers, etc.
  writeFileSync(
    join(projectDir, 'next.config.ts'),
    `import type { NextConfig } from 'next';

const config: NextConfig = {
  // Add your custom Next.js config here.
  // ShipSite merges this with its own config automatically.
  //
  // Examples:
  // redirects: async () => [
  //   { source: '/old-page', destination: '/new-page', permanent: true },
  // ],
  // headers: async () => [
  //   { source: '/(.*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] },
  // ],
};

export default config;
`,
  );

  // .gitignore
  writeFileSync(
    join(projectDir, '.gitignore'),
    `node_modules/
.next/
.shipsite/
.content-collections/
*.tsbuildinfo
`,
  );

  // package.json
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'shipsite dev',
          build: 'shipsite build',
          validate: 'shipsite validate',
        },
        dependencies: {
          '@shipsite.dev/cli': '^0.1.0',
          '@shipsite.dev/core': '^0.1.0',
          '@shipsite.dev/components': '^0.1.0',
          next: '16.1.6',
          react: '19.2.3',
          'react-dom': '19.2.3',
          '@radix-ui/react-accordion': '^1.2.3',
          '@radix-ui/react-dialog': '^1.1.6',
          '@radix-ui/react-slot': '^1.2.0',
          'class-variance-authority': '^0.7.1',
          'clsx': '^2.1.1',
          'lucide-react': '^0.475.0',
          'next-themes': '^0.4.4',
          'tailwind-merge': '^3.0.2',
          'tw-animate-css': '^1.2.5',
        },
        devDependencies: {
          '@tailwindcss/postcss': '^4',
          '@types/node': '^20',
          '@types/react': '^19',
          tailwindcss: '^4',
          typescript: '^5',
        },
      },
      null,
      2,
    ) + '\n',
  );

  s.stop('Project created!');

  // Initialize git
  try {
    execSync('git init', { cwd: projectDir, stdio: 'ignore' });
    p.log.success('Initialized git repository');
  } catch {
    // Git not available
  }

  p.note(
    [`cd ${projectName}`, 'npm install', 'npx shipsite dev'].join('\n'),
    'Next steps',
  );

  p.outro('Happy shipping!');
}

main().catch(console.error);
