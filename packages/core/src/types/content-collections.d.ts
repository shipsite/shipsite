/**
 * Type declarations for the virtual 'content-collections' module.
 * This module is generated at build time by @content-collections/core.
 * These types allow @shipsite/core to compile standalone.
 */
declare module 'content-collections' {
  export interface SitePage {
    title: string;
    description: string;
    content: string;
    category?: string;
    date?: string;
    image?: string;
    readingTime?: number;
    featured?: boolean;
    author?: string;
    slug?: string;
    locale: string;
    contentFolder: string;
    contentId: string;
    kind: string;
    excerpt: string;
    body: { raw: string };
    _meta: {
      fileName: string;
      directory: string;
      path: string;
      filePath: string;
    };
  }

  export const allSitePages: SitePage[];
}
