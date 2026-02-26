import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

/**
 * Resolve the content kind from a directory path.
 */
export function resolveKind(directory: string): string {
  if (directory.startsWith('blog/')) {
    return directory.split('/').length > 1 ? 'blog-article' : 'blog-index';
  }
  return 'page';
}

/**
 * Return the excerpt for blog listings.
 * Uses explicit excerpt if provided, otherwise falls back to description.
 */
export function extractExcerpt(excerpt: string | undefined, description: string | undefined): string {
  return (excerpt || description || '').trim();
}

export const sitePages = defineCollection({
  name: 'sitePages',
  directory: 'content',
  include: '**/*.mdx',
  schema: z.object({
    content: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),
    date: z.string().optional(),
    image: z.string().optional(),
    readingTime: z.number().optional(),
    featured: z.boolean().optional(),
    author: z.string().optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    hidden: z.boolean().optional(),
    noindex: z.boolean().optional(),
  }),
  transform: (doc) => {
    const locale = doc._meta.fileName.replace(/\.mdx$/, '');
    const contentFolder = doc._meta.directory;
    const contentId = doc._meta.path.replace(/\.mdx$/, '');
    const kind = resolveKind(doc._meta.directory);
    const excerpt = extractExcerpt(doc.excerpt, doc.description);

    return {
      ...doc,
      locale,
      contentFolder,
      contentId,
      kind,
      excerpt,
      body: { raw: doc.content },
    };
  },
});

export function createContentCollectionsConfig() {
  return defineConfig({
    content: [sitePages],
  });
}
