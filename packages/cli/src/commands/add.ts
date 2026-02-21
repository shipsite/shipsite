import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

export async function add(args: string[]) {
  const type = args[0];

  switch (type) {
    case 'page':
      await addPage(args[1]);
      break;
    case 'blog':
      await addBlog(args.slice(1).join(' '));
      break;
    default:
      console.log(
        'Usage: shipsite add page <name> | shipsite add blog <title>',
      );
  }
}

async function addPage(name: string) {
  if (!name) {
    console.error(
      'Error: Page name required. Usage: shipsite add page <name>',
    );
    process.exit(1);
  }

  const rootDir = process.cwd();
  const configPath = join(rootDir, 'shipsite.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  const contentDir = join(rootDir, 'content', name);
  mkdirSync(contentDir, { recursive: true });

  const defaultLocale = config.i18n?.defaultLocale || 'en';
  const mdxPath = join(contentDir, `${defaultLocale}.mdx`);

  if (!existsSync(mdxPath)) {
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    writeFileSync(
      mdxPath,
      `---
title: "${title}"
description: ""
---

<PageHero title="${title}" />
`,
    );
    console.log(`  Created content/${name}/${defaultLocale}.mdx`);
  }

  config.pages.push({
    slug: name,
    type: 'page',
    content: name,
    locales: [defaultLocale],
  });

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`  Added "${name}" to shipsite.json pages`);
}

async function addBlog(title: string) {
  if (!title) {
    console.error(
      'Error: Blog title required. Usage: shipsite add blog "My Post Title"',
    );
    process.exit(1);
  }

  const rootDir = process.cwd();
  const configPath = join(rootDir, 'shipsite.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const contentDir = join(rootDir, 'content', 'blog', slug);
  mkdirSync(contentDir, { recursive: true });

  const defaultLocale = config.i18n?.defaultLocale || 'en';
  const mdxPath = join(contentDir, `${defaultLocale}.mdx`);

  if (!existsSync(mdxPath)) {
    const today = new Date().toISOString().split('T')[0];
    writeFileSync(
      mdxPath,
      `---
title: "${title}"
description: ""
date: "${today}"
image: "/images/placeholder.webp"
readingTime: 5
featured: false
author: ""
---

<BlogArticle>

<BlogIntro>
Write your introduction here.
</BlogIntro>

## Getting Started

Your content here...

</BlogArticle>
`,
    );
    console.log(`  Created content/blog/${slug}/${defaultLocale}.mdx`);
  }

  config.pages.push({
    slug: `blog/${slug}`,
    type: 'blog-article',
    content: `blog/${slug}`,
    locales: [defaultLocale],
  });

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`  Added "blog/${slug}" to shipsite.json pages`);
}
