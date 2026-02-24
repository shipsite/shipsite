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
            { label: localizedLabel('Blog', locales), href: '/blog' },
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
        slug: 'features',
        type: 'page',
        content: 'features',
        locales: [defaultLocale],
      },
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
        slug: 'blog/building-your-first-project',
        type: 'blog-article',
        content: 'blog/building-your-first-project',
        locales: [defaultLocale],
      },
      {
        slug: 'blog/best-practices',
        type: 'blog-article',
        content: 'blog/best-practices',
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
    'features',
    'pricing',
    'blog',
    'blog/getting-started',
    'blog/building-your-first-project',
    'blog/best-practices',
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
title: "${projectName} \u2014 Ship Products Faster"
description: "The modern platform that helps teams build, launch, and scale products with confidence."
---

<Hero
  badge="Just launched"
  title="Ship Products Faster Than Ever"
  description="The modern platform that helps teams build, launch, and scale with confidence. Stop wrestling with infrastructure and start delivering value."
  primaryCta={{ label: "Start Free Trial", href: "https://app.${projectName}.com/signup" }}
  secondaryCta={{ label: "See How It Works", href: "#how-it-works" }}
/>

<SocialProof text="Trusted by 2,000+ teams worldwide" />

<Features title="Everything You Need to Succeed" description="Powerful features designed to streamline your workflow from day one." columns={3}>
  <Feature title="Lightning-Fast Setup" description="Go from zero to production in under five minutes. Our guided onboarding handles the heavy lifting so you can focus on what matters." />
  <Feature title="Real-Time Collaboration" description="Work together seamlessly with live editing, comments, and shared workspaces. Keep your entire team on the same page." />
  <Feature title="Advanced Analytics" description="Understand your users with built-in analytics dashboards. Track engagement, retention, and growth metrics out of the box." />
  <Feature title="Workflow Automation" description="Automate repetitive tasks with powerful triggers and actions. Set up once and let the system handle the rest." />
  <Feature title="Enterprise-Grade Security" description="SOC 2 compliant with end-to-end encryption, SSO, and role-based access controls. Your data stays safe." />
  <Feature title="Seamless Integrations" description="Connect with the tools you already use. Slack, GitHub, Jira, and 100+ integrations available out of the box." />
</Features>

<BentoGrid title="Built for Modern Teams" description="See what sets ${projectName} apart from the rest.">
  <BentoItem title="Visual Workflow Builder" description="Design complex workflows with an intuitive drag-and-drop interface. No coding required for common automation tasks." span={2} />
  <BentoItem title="API-First Architecture" description="Every feature is accessible via our REST and GraphQL APIs. Build custom integrations with comprehensive documentation." />
  <BentoItem title="Global Edge Network" description="Deploy to 150+ edge locations worldwide. Your users get sub-100ms response times no matter where they are." />
</BentoGrid>

<Steps id="how-it-works" title="How It Works" description="Get up and running in three simple steps.">
  <Step title="Create Your Account" description="Sign up in seconds with your email or SSO provider. No credit card required to get started." />
  <Step title="Configure Your Workspace" description="Import your existing data, invite your team, and customize your workspace to match your workflow." />
  <Step title="Launch and Scale" description="Go live with one click. Our infrastructure scales automatically to handle any amount of traffic." />
</Steps>

<Testimonials title="Loved by Teams Everywhere" columns={3}>
  <TestimonialCard quote="We cut our development time in half after switching. The workflow automation alone saved us 20 hours a week." author="Sarah Chen" role="VP of Engineering" company="Acme Corp" rating={5} />
  <TestimonialCard quote="The best developer experience I have ever used. Everything just works, and the API documentation is phenomenal." author="Marcus Rivera" role="Lead Developer" company="TechFlow" rating={5} />
  <TestimonialCard quote="Finally a platform that scales with us. We went from 1,000 to 100,000 users without changing a single config." author="Emily Nakamura" role="CTO" company="ScaleUp Inc" rating={5} />
</Testimonials>

<Stats title="The Numbers Speak for Themselves">
  <Stat value="10K+" label="Active Teams" description="Teams shipping with ${projectName}" />
  <Stat value="99.9%" label="Uptime" description="Enterprise-grade reliability" />
  <Stat value="150+" label="Integrations" description="Connect your favorite tools" />
  <Stat value="4.9/5" label="Rating" description="Average customer satisfaction" />
</Stats>

<FAQ title="Frequently Asked Questions">
  <FAQItem question="Is there a free plan?">
    Yes! Our free plan includes all core features for up to 5 team members. No credit card required and no time limit.
  </FAQItem>
  <FAQItem question="How long does setup take?">
    Most teams are up and running in under 5 minutes. Our guided onboarding walks you through everything, and you can import existing data with a single click.
  </FAQItem>
  <FAQItem question="Can I cancel anytime?">
    Absolutely. There are no long-term contracts or cancellation fees. You can upgrade, downgrade, or cancel your plan at any time.
  </FAQItem>
  <FAQItem question="Is my data secure?">
    Security is our top priority. We are SOC 2 Type II compliant, use end-to-end encryption, and offer SSO and role-based access controls on all paid plans.
  </FAQItem>
  <FAQItem question="Do you offer support?">
    We provide email support on all plans and priority support with a dedicated account manager on Pro and Enterprise plans. Our average response time is under 2 hours.
  </FAQItem>
</FAQ>

<BannerCTA
  title="Ready to ship faster?"
  buttonText="Start Your Free Trial"
  buttonHref="https://app.${projectName}.com/signup"
  subtext="No credit card required. Free plan available forever."
/>
`,
  );

  // Features page
  writeFileSync(
    join(projectDir, 'content', 'features', 'en.mdx'),
    `---
title: "Features \u2014 ${projectName}"
description: "Explore the full suite of tools and capabilities that make ${projectName} the platform of choice for modern teams."
---

<PageHero
  title="Features"
  description="Everything your team needs to build, ship, and scale \u2014 all in one platform."
/>

<Features title="Core Capabilities" description="A complete toolkit designed for speed, reliability, and collaboration." columns={3}>
  <Feature title="Visual Workflow Builder" description="Design and automate complex processes with an intuitive drag-and-drop editor. No code required for common tasks." />
  <Feature title="Real-Time Collaboration" description="Edit together with live cursors, inline comments, and instant sync across all devices and team members." />
  <Feature title="Advanced Analytics" description="Track every metric that matters with customizable dashboards, funnel analysis, and automatic reports." />
  <Feature title="API-First Platform" description="Build anything with our comprehensive REST and GraphQL APIs. Full OpenAPI specs and SDKs for every major language." />
  <Feature title="Enterprise Security" description="SOC 2 Type II certified with end-to-end encryption, SSO, SCIM provisioning, and granular role-based access." />
  <Feature title="Global Infrastructure" description="Deploy to 150+ edge locations. Automatic failover, load balancing, and sub-100ms latency worldwide." />
</Features>

<BentoGrid title="Deep Dive" description="See how each capability helps your team move faster.">
  <BentoItem title="Workflow Automation" description="Set up triggers, conditions, and actions to automate any process. From onboarding sequences to deployment pipelines, eliminate manual work." span={2} />
  <BentoItem title="Version Control" description="Built-in versioning for every change. Roll back instantly, compare diffs, and audit who changed what and when." />
  <BentoItem title="Custom Integrations" description="Connect ${projectName} to your stack with pre-built connectors for Slack, GitHub, Jira, Salesforce, and 100+ more." />
  <BentoItem title="Team Management" description="Organize members into teams and projects with fine-grained permissions. Manage access at scale with SCIM and directory sync." span={2} />
</BentoGrid>

<Testimonial
  quote="We evaluated a dozen platforms before choosing ${projectName}. The combination of developer experience, reliability, and customer support is unmatched."
  author="James Park"
  role="Head of Platform Engineering"
  company="Moneta Systems"
/>

<BannerCTA
  title="See it in action"
  buttonText="Start Your Free Trial"
  buttonHref="https://app.${projectName}.com/signup"
  subtext="No credit card required. Free plan available forever."
/>
`,
  );

  // Pricing
  writeFileSync(
    join(projectDir, 'content', 'pricing', 'en.mdx'),
    `---
title: "Pricing \u2014 ${projectName}"
description: "Simple, transparent pricing for teams of all sizes."
---

<PricingSection title="Simple, Transparent Pricing" description="Start free. Upgrade when you are ready. No surprises.">
  <PricingPlan name="Free" price="$0" description="For individuals and small projects" features={["Up to 5 team members", "Core features included", "1 GB storage", "Community support", "Basic analytics"]} cta={{ label: "Get Started Free", href: "https://app.${projectName}.com/signup" }} />
  <PricingPlan name="Pro" price="$29/mo" yearlyPrice="$24/mo" description="For growing teams that need more" features={["Unlimited team members", "All features included", "50 GB storage", "Priority email support", "Advanced analytics", "Custom integrations", "SSO authentication"]} cta={{ label: "Start Free Trial", href: "https://app.${projectName}.com/signup?plan=pro" }} popular={true} />
  <PricingPlan name="Enterprise" price="Custom" description="For organizations that need control" features={["Everything in Pro", "Unlimited storage", "Dedicated account manager", "99.99% uptime SLA", "SCIM provisioning", "Custom contracts", "On-premise deployment"]} cta={{ label: "Contact Sales", href: "mailto:sales@${projectName}.com" }} />
</PricingSection>

<FAQ title="Pricing Questions">
  <FAQItem question="Can I switch plans at any time?">
    Yes. You can upgrade, downgrade, or cancel at any time. When you upgrade, you only pay the prorated difference. When you downgrade, the credit is applied to your next billing cycle.
  </FAQItem>
  <FAQItem question="What happens when my trial ends?">
    After your 14-day Pro trial, you can continue on the Free plan with no data loss. All your projects and settings are preserved. Upgrade whenever you are ready.
  </FAQItem>
  <FAQItem question="Do you offer discounts for startups or nonprofits?">
    Yes! We offer 50% off Pro plans for qualifying startups and nonprofits. Contact our sales team to learn more about eligibility.
  </FAQItem>
</FAQ>
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

  // Blog post: Getting Started
  writeFileSync(
    join(projectDir, 'content', 'blog', 'getting-started', 'en.mdx'),
    `---
title: "Getting Started with ${projectName}"
description: "A complete guide to setting up your account, configuring your workspace, and launching your first project."
excerpt: "Everything you need to go from sign-up to production in under five minutes."
date: "${today}"
readingTime: 5
author: default
featured: true
---

<BlogArticle>

## Step 1: Create Your Account

Head to [app.${projectName}.com/signup](https://app.${projectName}.com/signup) and create your free account. You can sign up with your email address or use SSO with Google or GitHub. No credit card is required and the free plan has no time limit.

Once you verify your email, you will land in your new workspace dashboard. This is your home base for managing projects, team members, and settings.

## Step 2: Set Up Your Workspace

Your workspace is where everything comes together. Start by personalizing it:

- **Invite your team** \u2014 Go to Settings and then Team to add members by email. You can assign roles like Admin, Editor, or Viewer to control access.
- **Connect your tools** \u2014 Visit the Integrations page to link Slack, GitHub, Jira, or any of our 100+ supported services. Notifications and data will sync automatically.
- **Import existing data** \u2014 If you are migrating from another platform, use the one-click import tool to bring your projects, files, and history along.

## Step 3: Launch Your First Project

Click "New Project" from the dashboard and choose a template or start from scratch. Every project comes with built-in version control, analytics, and collaboration tools.

Once your project is ready, hit "Deploy" to push it live. Our global edge network handles the rest, delivering your content with sub-100ms latency worldwide.

## What Comes Next

Now that you are up and running, explore the [Features](/features) page to discover advanced capabilities like workflow automation, custom integrations, and analytics dashboards. If you have questions, our support team is always here to help.

</BlogArticle>
`,
  );

  // Blog post: Building Your First Project
  writeFileSync(
    join(projectDir, 'content', 'blog', 'building-your-first-project', 'en.mdx'),
    `---
title: "Building Your First Project"
description: "A hands-on tutorial that walks you through creating, configuring, and deploying your first project."
excerpt: "Follow along as we build a project from scratch and deploy it to production."
date: "${today}"
readingTime: 6
author: default
---

<BlogArticle>

## Choosing the Right Template

When you create a new project, you can start from scratch or choose one of our pre-built templates. Templates come with sensible defaults for common use cases like marketing sites, internal dashboards, and API services.

For this tutorial, we will start with the "Starter" template. It includes a basic project structure, sample data, and a deployment pipeline that is ready to go.

## Configuring Your Project

Every project has a settings panel where you can customize behavior:

- **Environment Variables** \u2014 Store API keys, database URLs, and other secrets securely. They are encrypted at rest and never exposed in logs.
- **Custom Domains** \u2014 Add your own domain and we will provision an SSL certificate automatically. DNS changes typically propagate in under 10 minutes.
- **Webhooks** \u2014 Set up webhooks to trigger external services whenever specific events happen in your project.

Take a few minutes to review the defaults and adjust anything that does not match your requirements.

## Adding Collaborators

Projects support granular permissions. From the project settings, invite team members and assign one of three roles:

- **Admin** \u2014 Full access including billing and danger-zone settings.
- **Editor** \u2014 Can create, update, and deploy content.
- **Viewer** \u2014 Read-only access for stakeholders who need visibility.

Roles can be changed at any time without disrupting ongoing work.

## Deploying to Production

When you are happy with your project, click "Deploy" in the top-right corner. The platform runs your build pipeline, runs automated checks, and pushes the result to our global edge network.

Every deploy creates an immutable snapshot. If something goes wrong, you can roll back to any previous deploy in one click. There is no downtime during rollbacks.

</BlogArticle>
`,
  );

  // Blog post: Best Practices
  writeFileSync(
    join(projectDir, 'content', 'blog', 'best-practices', 'en.mdx'),
    `---
title: "Best Practices for Teams"
description: "Proven strategies for getting the most out of ${projectName}, from workspace organization to deployment workflows."
excerpt: "Tips and patterns from teams that ship fast and stay organized."
date: "${today}"
readingTime: 4
author: default
---

<BlogArticle>

## Organize with Purpose

The most productive teams keep their workspaces clean and predictable. Here are a few patterns that work well:

- **One project per product or service** \u2014 Avoid cramming unrelated work into a single project. Separate projects are easier to manage, permission, and monitor.
- **Use consistent naming** \u2014 Agree on a naming convention early. Something like "team-product-environment" makes it easy to find what you need at a glance.
- **Archive instead of delete** \u2014 When a project wraps up, archive it rather than deleting it. Archives are searchable and can be restored if you need to reference old work.

## Automate Repetitive Work

Workflow automation is one of the most impactful features available. Start with the tasks your team does repeatedly:

- **Deployment notifications** \u2014 Send a Slack message every time a deploy succeeds or fails.
- **Review reminders** \u2014 Automatically nudge reviewers when a change has been waiting too long.
- **Data backups** \u2014 Schedule nightly exports of critical data to your own storage.

Each automation you add frees up time for the work that actually matters.

## Ship with Confidence

A reliable deployment process reduces stress and prevents outages. Follow these guidelines:

- **Use preview deployments** \u2014 Every branch can have its own preview URL. Share it with stakeholders for feedback before merging.
- **Enable automatic rollbacks** \u2014 Configure health checks so the platform can roll back a bad deploy before users notice.
- **Monitor after every release** \u2014 Check the analytics dashboard for error spikes or performance regressions in the first 30 minutes after a deploy.

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
          '@shipsite.dev/cli': `^${version}`,
          '@shipsite.dev/core': `^${version}`,
          '@shipsite.dev/components': `^${version}`,
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
