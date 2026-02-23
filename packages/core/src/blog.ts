import { allSitePages } from 'content-collections';
import { getConfig } from './config';
import { getLocalizedField } from './i18n';

// Re-export for backward compatibility
export { getLocalizedField } from './i18n';

export interface ResolvedArticle {
  slug: string;
  contentKey: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  categoryKey: string;
  date: string;
  image: string;
  readingTime: number;
  featured: boolean;
  authorKey: string;
}

export interface ResolvedAuthor {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface ResolvedCategory {
  key: string;
  label: string;
}

export function resolveAuthor(
  key: string,
  locale: string,
): ResolvedAuthor | undefined {
  const config = getConfig();
  const authors = config.blog?.authors;
  if (!authors) return undefined;

  const author = authors[key];
  if (!author) return undefined;

  return {
    name: author.name,
    role: getLocalizedField(author.role, locale),
    image: author.image || '',
    bio: getLocalizedField(author.bio, locale),
  };
}

export function getBlogArticles(locale: string): ResolvedArticle[] {
  const config = getConfig();
  const categories = config.blog?.categories || [];
  const categoryMap = config.blog?.categoryMap || {};

  function normalizeCategoryKey(raw: string): string {
    return categoryMap[raw] || '';
  }

  function getCategoryLabel(key: string, loc: string): string {
    const entry = categories.find((c) => c.key === key);
    if (!entry) return '';
    return entry.label[loc] || entry.label.en || '';
  }

  return allSitePages
    .filter((doc) => doc.kind === 'blog-article' && doc.locale === locale)
    .map((doc) => {
      const contentKey = doc.contentFolder.replace(/^blog\//, '');
      const slug = doc.slug || contentKey;
      const rawCategory = doc.category || '';
      const categoryKey = normalizeCategoryKey(rawCategory);
      return {
        slug,
        contentKey,
        title: doc.title,
        description: doc.description,
        excerpt: doc.excerpt || doc.description,
        category: categoryKey
          ? getCategoryLabel(categoryKey, locale) || rawCategory
          : rawCategory,
        categoryKey,
        date: doc.date || '',
        image: doc.image || '/images/placeholder.webp',
        readingTime: doc.readingTime || 5,
        featured: doc.featured || false,
        authorKey: doc.author || '',
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCategories(locale: string): ResolvedCategory[] {
  const config = getConfig();
  const categories = config.blog?.categories || [];
  return categories.map((entry) => ({
    key: entry.key,
    label: entry.label[locale] || entry.label.en || entry.key,
  }));
}
