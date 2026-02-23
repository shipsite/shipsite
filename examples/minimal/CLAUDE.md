<!-- BEGIN SHIPSITE AUTO-GENERATED - DO NOT EDIT THIS SECTION -->
# Test Site — ShipSite Project

## Tech Stack

- **Framework:** Next.js (App Router)
- **Content:** MDX files in `content/` — processed by content-collections
- **Styling:** Tailwind CSS v4 + shadcn/ui design tokens
- **i18n:** next-intl (locales: en — default: en)
- **Components:** `@shipsite.dev/components` — pre-built marketing, blog & legal components

## Project Structure

```
shipsite.json          # Site configuration (pages, nav, footer, colors, i18n)
content/               # MDX content files, one folder per page
  {page-name}/
    {locale}.mdx       # Content file per locale
components/            # Custom components (auto-available in MDX)
public/                # Static assets (images, fonts, favicons)
.shipsite/             # Generated workspace (do NOT edit)
```

## Content Conventions

- Each page is an MDX file at `content/{page-name}/{locale}.mdx`
- Markdown is automatically styled — no need to import prose wrappers
- ShipSite components are globally available in MDX — no imports needed
- Images go in `public/images/` and are referenced as `/images/filename.ext`
- Custom components in `components/` are also auto-available in MDX

## Frontmatter by Page Type

### Landing / Page (`type: "landing"` or `type: "page"`)
```yaml
---
title: "Page Title — Site Name"
description: "Meta description for SEO."
---
```
Then use marketing components directly:
```mdx
<Hero title="..." description="..." primaryCta={{ label: "...", href: "..." }} />
<Features title="...">
  <Feature title="..." description="..." />
</Features>
```

### Blog Article (`type: "blog-article"`)
```yaml
---
title: "Article Title"
description: "Meta description."
excerpt: "Short preview text for blog index cards."
date: "YYYY-MM-DD"
readingTime: 3
author: default
---
```
Wrap content in `<BlogArticle>`:
```mdx
<BlogArticle>

## Section Heading

Paragraph content with **bold** and [links](/path).

</BlogArticle>
```

### Blog Index (`type: "blog-index"`)
```yaml
---
title: "Blog — Site Name"
description: "Meta description."
---
```
```mdx
<BlogIndex title="Blog" description="Latest posts." />
```

### Legal / Content (`type: "legal"`)
```yaml
---
title: "Privacy Policy"
description: "How we handle your data."
---
```
```mdx
<ContentPage title="Privacy Policy" lastUpdated="YYYY-MM-DD">
  <ContentSection title="1. Section">Content here.</ContentSection>
</ContentPage>
```

## Available Components

### Marketing
- **Hero** — Full-width hero section with animated title, description, optional badge, primary/secondary CTAs, and a responsive device mockup image. Uses a top glow effect for visual emphasis.
- **Feature** — Individual feature card with an optional icon, title, and description. Used as a child of the Features grid component.
- **Features** — Section that displays a grid of Feature cards with an optional section title and description. Supports 2, 3, or 4 column layouts.
- **AlternatingFeatureItem** — Individual bullet-point item within an AlternatingFeatureRow. Displays an optional icon, title, and description.
- **AlternatingFeatureRow** — A two-column row with text content on one side and a responsive mockup image on the other. Even rows automatically flip the layout. Supports light/dark mode images.
- **AlternatingFeatures** — Container section for alternating feature rows. Renders rows with alternating text/image layout separated by dividers.
- **PricingPlan** — Data-only component that defines a single pricing plan. Must be used as a child of PricingSection. Renders nothing on its own; its props are consumed by the parent.
- **ComparisonRow** — Data-only component that defines a row in the pricing comparison table. Must be used as a child of PricingSection.
- **ComparisonCategory** — Data-only component that adds a category header row in the pricing comparison table. Must be used as a child of PricingSection.
- **PricingSection** — Full pricing section with plan cards, optional monthly/yearly toggle, and an optional feature comparison table. Consumes PricingPlan, ComparisonRow, and ComparisonCategory children.
- **Companies** — Logo showcase section with two variants: a continuous marquee scroll animation or a static inline flex layout. Supports logo names, versions, and badges in inline mode.
- **Testimonial** — Single large testimonial quote block with author info, displayed in a centered glass card.
- **TestimonialCard** — Compact testimonial card with optional star rating. Used as a child of the Testimonials grid component.
- **Testimonials** — Grid section that displays multiple TestimonialCard components with an optional section title and description.
- **BannerCTA** — Full-width call-to-action banner with a centered glow effect, title, optional subtext, and a primary button. Supports additional children content.
- **BannerFeature** — Small inline feature item with an optional icon, designed to be placed inside a BannerCTA as a child.
- **FAQItem** — Individual FAQ accordion item with a question trigger and expandable answer content. Used as a child of FAQ.
- **FAQ** — FAQ section with a collapsible accordion. Contains FAQItem children with question/answer pairs.
- **Step** — Data-only component that defines a single step. Must be used as a child of Steps. Renders nothing on its own; its props are consumed by the parent.
- **Steps** — Numbered step-by-step section with connected timeline indicators. Consumes Step children to display a vertical progression.
- **CardGridItem** — Individual card in a grid layout with an optional icon, title, description, and link. Used as a child of CardGrid.
- **CardGrid** — Responsive grid container for CardGridItem children. Supports 2, 3, or 4 column layouts.
- **CalloutCard** — Highlighted callout box with a colored border for info, success, or warning messages. Useful for drawing attention to important content within a page.
- **Stat** — Data-only component that defines a single statistic. Must be used as a child of Stats. Renders nothing on its own; its props are consumed by the parent.
- **Stats** — Section displaying key statistics in a 2x2 or 4-column grid with large gradient numbers. Consumes Stat children.
- **BentoItem** — Individual bento grid card with a title, optional description, optional full-bleed image, and support for custom children. Supports spanning 1 or 2 columns.
- **BentoGrid** — Asymmetric grid layout section for showcasing features in a bento-box style. Uses a 3-column grid with equal-height rows. Contains BentoItem children.
- **GalleryItem** — Individual gallery image card with a hover zoom effect and an optional caption. Used as a child of Gallery.
- **Gallery** — Responsive image gallery section with optional title and description. Displays GalleryItem children in a configurable grid.
- **SocialProof** — Compact social proof section showing stacked user avatars with a text message and optional subtext. Ideal for displaying user counts or trust indicators.
- **CarouselItem** — Individual card within a horizontally scrollable Carousel. Supports an image, title, description, and custom children.
- **Carousel** — Horizontally scrollable carousel section with snap-scrolling, left/right navigation buttons, and optional title/description. Contains CarouselItem children.
- **TabItem** — Data-only component that defines a single tab. Must be used as a child of TabsSection. Renders nothing on its own; its props are consumed by the parent.
- **TabsSection** — Interactive tabbed section with pill-style tab buttons and a content panel that changes based on the active tab. Consumes TabItem children.
- **PageHero** — Lightweight page hero section with centered title, optional description, badge, and children. Suitable for inner pages that do not need the full Hero with image and CTAs.

### Blog
- **BlogArticle** — Top-level wrapper for blog article content. Renders a centered, max-width article container with vertical padding.
- **BlogIndex** — Blog listing page wrapper with an optional title, description, and children for rendering blog post cards or custom content.

### Content
- **ContentSection** — Titled section with prose-style formatting for paragraphs and lists. Used as a child of ContentPage for structured text pages (legal, about, FAQ, etc.).
- **ContentPage** — Top-level wrapper for text-heavy pages (legal, about, contact, etc.). Renders a narrow, centered container with a title and optional last-updated date.


## Key Rules

1. **Never edit files inside `.shipsite/`** — they are auto-generated and will be overwritten.
2. **Don't import ShipSite components** — they are globally registered in MDX.
3. **Page structure is defined in `shipsite.json`** — to add a page, add an entry to the `pages` array and create the content folder.
4. **One MDX file per locale per page** — e.g. `content/landing/en.mdx`, `content/landing/de.mdx`.
5. **Use the component catalog above** to pick the right component for each section.

<!-- END SHIPSITE AUTO-GENERATED -->

