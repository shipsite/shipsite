import React from 'react';
import { Section } from '../ui/section';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface BlogArticleAuthor {
  name: string;
  role: string;
  image: string;
}

interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  date: string;
  image: ImageSource;
  readingTime: number;
  href: string;
  featured?: boolean;
  author?: BlogArticleAuthor;
}

interface BlogIndexProps {
  id?: string;
  title?: string;
  description?: string;
  articles?: BlogArticle[];
  children?: React.ReactNode;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <a
      key={article.slug}
      href={article.href}
      className="group block rounded-3xl p-2 -m-2 hover:bg-muted/50 hover:scale-[1.015] transition-all duration-300 ease-out focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div className="aspect-[3/2] overflow-hidden rounded-2xl">
        <ThemeImage
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="pt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          {article.category && (
            <span className="font-medium text-primary">{article.category}</span>
          )}
          {article.date && <time dateTime={article.date}>{formatDate(article.date)}</time>}
        </div>
        <h3 className="text-lg font-semibold leading-snug text-foreground mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-base text-muted-foreground line-clamp-2 mb-4">
          {article.excerpt}
        </p>
        {article.author && (
          <div className="flex items-center gap-3">
            {article.author.image && (
              <img
                src={article.author.image}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <div className="text-sm font-medium text-foreground">{article.author.name}</div>
              {article.author.role && (
                <div className="text-xs text-muted-foreground">{article.author.role}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </a>
  );
}

export function BlogIndex({ id, title, description, articles, children }: BlogIndexProps) {
  const featured = articles?.filter((a) => a.featured) ?? [];
  const all = articles ?? [];

  return (
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        {featured.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {featured.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
            <hr className="border-border mb-12" />
            <h3 className="text-xl font-semibold text-foreground mb-8">All Articles</h3>
          </>
        )}
        {all.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {all.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
        {children}
      </div>
    </Section>
  );
}
