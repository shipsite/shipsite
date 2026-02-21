import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

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
  }),
  transform: (doc) => {
    const locale = doc._meta.fileName.replace(/\.mdx$/, '');
    const contentFolder = doc._meta.directory;
    const contentId = doc._meta.path.replace(/\.mdx$/, '');

    const path = doc._meta.directory;
    let kind: string;
    if (path.startsWith('blog/')) {
      kind = path.split('/').length > 1 ? 'blog-article' : 'blog-index';
    } else {
      kind = 'page';
    }

    // Extract excerpt from BlogIntro component
    const raw = doc.content;
    const match = raw.match(/<BlogIntro>\s*([\s\S]*?)\s*<\/BlogIntro>/);
    const excerpt = match
      ? match[1]
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/[*_~`]/g, '')
          .replace(/\n+/g, ' ')
          .trim()
      : '';

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
