import type React from 'react';
import { compileMDX } from 'next-mdx-remote/rsc';
import { allSitePages } from 'content-collections';

export interface PageFrontmatter {
  title: string;
  description: string;
  category?: string;
  date?: string;
  dateModified?: string;
  image?: string;
  readingTime?: number;
  wordCount?: number;
  featured?: boolean;
  author?: string;
}

export async function getPageContent(
  pageName: string,
  locale: string,
  components: Record<string, unknown> = {},
) {
  const page = allSitePages.find(
    (doc) => doc.contentFolder === pageName && doc.locale === locale,
  );

  if (!page) {
    throw new Error(`MDX content not found: ${pageName}/${locale}`);
  }

  const allComponents = { ...components };

  // Inject contentFolder so wrapper components can resolve their own metadata
  const contentFolderInjections: Record<string, string> = {
    'blog/': 'BlogArticle',
  };

  for (const [prefix, componentName] of Object.entries(
    contentFolderInjections,
  )) {
    const isNested =
      pageName.startsWith(prefix) && pageName !== prefix.slice(0, -1);
    if (isNested) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Orig = (components as Record<string, React.FC<any>>)[
        componentName
      ];
      if (Orig) {
        allComponents[componentName] = async (
          props: Record<string, unknown>,
        ) => Orig({ ...props, contentFolder: pageName });
      }
    }
  }

  const { content } = await compileMDX<PageFrontmatter>({
    source: page.body.raw,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components: allComponents as Record<string, React.ComponentType<any>>,
    options: {
      parseFrontmatter: false,
      blockJS: false,
      blockDangerousJS: false,
    },
  });

  const frontmatter: PageFrontmatter = {
    title: page.title,
    description: page.description,
    category: page.category || undefined,
    date: page.date || undefined,
    image: page.image || undefined,
    readingTime: page.readingTime || undefined,
    featured: page.featured || undefined,
    author: page.author || undefined,
  };

  return { content, frontmatter };
}

export function getAvailablePages(): string[] {
  return Array.from(
    new Set(allSitePages.map((page) => page.contentFolder).filter(Boolean)),
  );
}

export function getAvailableLocales(pageName: string): string[] {
  return allSitePages
    .filter((page) => page.contentFolder === pageName)
    .map((page) => page.locale);
}
