import React from 'react';
import { Section } from '../ui/section';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  date: string;
  image: ImageSource;
  readingTime: number;
  href: string;
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

export function BlogIndex({ id, title, description, articles, children }: BlogIndexProps) {
  return (
    <Section id={id}>
      <div className="container-main">
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        {articles && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <a
                key={article.slug}
                href={article.href}
                className="group block rounded-xl glass-1 hover:glass-2 transition-all overflow-hidden focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <ThemeImage
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  {article.category && (
                    <span className="inline-block text-xs font-medium text-primary mb-2">
                      {article.category}
                    </span>
                  )}
                  <h3 className="font-semibold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {article.date && <time dateTime={article.date}>{formatDate(article.date)}</time>}
                    {article.readingTime > 0 && <span>{article.readingTime} min read</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        {children}
      </div>
    </Section>
  );
}
