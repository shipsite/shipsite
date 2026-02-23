'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface BlogArticleAuthor {
  name: string;
  role: string;
  image: string;
}

interface BlogArticleClientProps {
  children: React.ReactNode;
  author?: BlogArticleAuthor;
  date?: string;
  readingTime?: number;
}

export function BlogArticleClient({
  children,
  author,
  date,
  readingTime,
}: BlogArticleClientProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [activeH2Id, setActiveH2Id] = useState('');

  // Extract headings from rendered content
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const rafId = requestAnimationFrame(() => {
      const headings = el.querySelectorAll('h2, h3');
      const items: TocItem[] = [];
      headings.forEach((heading) => {
        const title = heading.textContent?.trim() || '';
        if (!title || heading.hasAttribute('data-toc-exclude')) return;
        if (!heading.id) {
          heading.id =
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || '';
        }
        items.push({
          id: heading.id,
          title,
          level: heading.tagName === 'H2' ? 2 : 3,
        });
      });
      setTocItems(items);
    });
    return () => cancelAnimationFrame(rafId);
  }, [children]);

  // IntersectionObserver for active heading tracking
  useEffect(() => {
    const el = contentRef.current;
    if (!el || tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);
            const tocItem = tocItems.find((t) => t.id === id);
            if (tocItem?.level === 2) {
              setActiveH2Id(id);
            } else if (tocItem?.level === 3) {
              const idx = tocItems.indexOf(tocItem);
              for (let i = idx - 1; i >= 0; i--) {
                if (tocItems[i].level === 2) {
                  setActiveH2Id(tocItems[i].id);
                  break;
                }
              }
            }
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    );
    tocItems.forEach((item) => {
      const h = document.getElementById(item.id);
      if (h) observer.observe(h);
    });
    return () => observer.disconnect();
  }, [tocItems]);

  // Smooth scroll to heading
  const scrollToHeading = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <article className="py-12 md:py-20">
      <div className="mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)]">
        <div className="flex gap-10 lg:gap-16">
          {/* Main content */}
          <div ref={contentRef} className="blog-content min-w-0 flex-1 max-w-3xl">
            {children}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* TOC */}
              {tocItems.length > 0 && (
                <nav>
                  <ul className="flex flex-col">
                    {tocItems.map((item) => {
                      const isActive = activeId === item.id;
                      if (item.level === 3) {
                        const idx = tocItems.indexOf(item);
                        let parentH2Id = '';
                        for (let i = idx - 1; i >= 0; i--) {
                          if (tocItems[i].level === 2) {
                            parentH2Id = tocItems[i].id;
                            break;
                          }
                        }
                        if (parentH2Id !== activeH2Id) return null;
                      }
                      return (
                        <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                          <button
                            onClick={() => scrollToHeading(item.id)}
                            className={cn(
                              'my-0.5 flex items-center gap-2 w-full cursor-pointer text-left',
                              isActive
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            <span
                              className={cn(
                                'w-3 h-px shrink-0 transition-colors',
                                isActive ? 'bg-primary' : 'bg-border',
                              )}
                            />
                            <span className="text-sm leading-snug line-clamp-1">
                              {item.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}

              {/* Author */}
              {author && (
                <>
                  {tocItems.length > 0 && <hr className="border-border" />}
                  <div className="flex flex-col gap-3">
                    {author.image && (
                      <img
                        src={author.image}
                        alt={author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{author.name}</p>
                      {author.role && (
                        <p className="text-xs text-muted-foreground">{author.role}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Meta */}
              {(formattedDate || readingTime) && (
                <>
                  {(tocItems.length > 0 || author) && !author && (
                    <hr className="border-border" />
                  )}
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {formattedDate && <span>{formattedDate}</span>}
                    {readingTime ? <span>{readingTime} min read</span> : null}
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
