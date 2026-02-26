/**
 * Page templates for creating new content pages.
 * Used by the CLI scaffolder and the Cloud editor.
 */

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  pageType: string;
  frontmatter: Record<string, string>;
  body: string;
}

function toTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function getTemplates(slug?: string): PageTemplate[] {
  const title = slug ? toTitle(slug) : "Your Page Title";

  return [
    {
      id: "landing",
      name: "Landing Page",
      description: "Hero, features, testimonials, and CTA",
      pageType: "landing",
      frontmatter: {
        title: `${title} — Site Name`,
        description: "A compelling description of your product or service.",
      },
      body: `<Hero
  title="${title}"
  description="A compelling subtitle that explains your value proposition."
  primaryCta={{ label: "Get Started", href: "#" }}
  secondaryCta={{ label: "Learn More", href: "#features" }}
/>

<Features id="features" title="Why Choose Us">
  <Feature title="Fast" description="Built for speed from the ground up." />
  <Feature title="Simple" description="No complex configuration required." />
  <Feature title="Reliable" description="99.9% uptime guaranteed." />
</Features>

<Testimonials title="What People Say">
  <TestimonialCard name="Jane Doe" role="CEO, Acme" rating={5}>
    This product transformed our workflow completely.
  </TestimonialCard>
  <TestimonialCard name="John Smith" role="CTO, Startup" rating={5}>
    The best tool we have adopted this year.
  </TestimonialCard>
</Testimonials>

<BannerCTA
  title="Ready to get started?"
  buttonText="Start Free Trial"
  buttonHref="#"
/>`,
    },
    {
      id: "pricing",
      name: "Pricing Page",
      description: "Pricing tiers with feature comparison",
      pageType: "page",
      frontmatter: {
        title: "Pricing — Site Name",
        description: "Simple, transparent pricing. No hidden fees.",
      },
      body: `<PricingSection title="Simple, Transparent Pricing" description="Choose the plan that works for you.">
  <PricingPlan
    name="Free"
    price="$0"
    period="/month"
    description="For individuals getting started."
    features={["1 project", "Basic analytics", "Community support"]}
    buttonText="Get Started"
    buttonHref="#"
  />
  <PricingPlan
    name="Pro"
    price="$19"
    period="/month"
    description="For growing teams."
    features={["5 projects", "Advanced analytics", "Priority support", "Custom domains"]}
    buttonText="Start Free Trial"
    buttonHref="#"
    highlighted={true}
  />
  <PricingPlan
    name="Enterprise"
    price="Custom"
    description="For large organizations."
    features={["Unlimited projects", "Dedicated support", "SLA", "SSO"]}
    buttonText="Contact Sales"
    buttonHref="#"
  />
</PricingSection>

<FAQ title="Frequently Asked Questions">
  <FAQItem question="Can I change plans later?">
    Yes, you can upgrade or downgrade at any time.
  </FAQItem>
  <FAQItem question="Is there a free trial?">
    Yes, all paid plans come with a 14-day free trial.
  </FAQItem>
</FAQ>`,
    },
    {
      id: "blog-article",
      name: "Blog Article",
      description: "Blog post with author, date, and reading time",
      pageType: "blog-article",
      frontmatter: {
        title: title,
        description: "A brief summary of this article.",
        date: today(),
        author: "default",
        readingTime: "5",
      },
      body: `<BlogArticle>

## Introduction

Start your article with a compelling introduction that hooks the reader.

## Main Section

Develop your main argument or story here. Use subheadings to break up long content.

### Key Point

Expand on important details with examples and evidence.

## Conclusion

Wrap up your article with a summary and call to action.

</BlogArticle>`,
    },
    {
      id: "about",
      name: "About Page",
      description: "Company info with mission and team",
      pageType: "page",
      frontmatter: {
        title: "About Us — Site Name",
        description: "Learn about our mission, values, and the team behind the product.",
      },
      body: `<PageHero
  title="About Us"
  description="We are on a mission to make the web better."
/>

## Our Mission

Describe your company mission and what drives your team.

## Our Values

<Features>
  <Feature title="Transparency" description="We believe in open communication." />
  <Feature title="Quality" description="We ship products we are proud of." />
  <Feature title="Community" description="We build for and with our users." />
</Features>

<BannerCTA
  title="Want to join our team?"
  buttonText="View Open Positions"
  buttonHref="#"
/>`,
    },
    {
      id: "legal",
      name: "Legal Page",
      description: "Privacy policy, terms of service",
      pageType: "legal",
      frontmatter: {
        title: title,
        description: `${title} for our service.`,
      },
      body: `<ContentPage title="${title}" lastUpdated="${today()}">
  <ContentSection title="1. Introduction">
    This document outlines the terms and conditions for using our service.
  </ContentSection>
  <ContentSection title="2. Data Collection">
    Describe what data you collect and how it is used.
  </ContentSection>
  <ContentSection title="3. Contact">
    If you have questions, contact us at support@example.com.
  </ContentSection>
</ContentPage>`,
    },
    {
      id: "blank",
      name: "Blank Page",
      description: "Empty page with just frontmatter",
      pageType: "page",
      frontmatter: {
        title: title,
        description: "",
      },
      body: "",
    },
  ];
}

/**
 * Generate a full MDX file from a template.
 */
export function renderTemplate(template: PageTemplate): string {
  const frontmatterLines = Object.entries(template.frontmatter)
    .map(([key, value]) => `${key}: "${value}"`)
    .join("\n");

  const parts = [`---\n${frontmatterLines}\n---`];
  if (template.body) {
    parts.push(template.body);
  }
  return parts.join("\n\n") + "\n";
}
