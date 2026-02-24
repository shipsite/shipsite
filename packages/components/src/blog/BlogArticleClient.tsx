'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeImage, type ImageSource } from '../ui/theme-image';

// --- Share Icons (inline SVGs for brand icons) ---

const LinkedInIcon = () => (
  <svg width="100%" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z"
      fill="currentColor"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg width="100%" viewBox="0 0 24 24" fill="none">
    <path
      d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
      fill="currentColor"
    />
  </svg>
);

const XIcon = () => (
  <svg width="100%" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.1385 18.75L8.72419 12.458L3.19803 18.75H0.860107L7.68695 10.9793L0.860107 1.25H6.86257L11.023 7.18013L16.2358 1.25H18.5738L12.0637 8.66084L19.141 18.75H13.1385ZM15.742 16.9762H14.1681L4.20766 3.02386H5.78185L9.77107 8.61047L10.4609 9.57989L15.742 16.9762Z"
      fill="currentColor"
    />
  </svg>
);

const RedditIcon = () => (
  <svg width="100%" viewBox="0 0 20 20" fill="none">
    <path d="M7.70781 9.99998C7.13471 9.99998 6.66687 10.4678 6.66687 11.0409C6.66687 11.614 7.13471 12.0819 7.70781 12.0819C8.28091 12.0819 8.74875 11.614 8.74875 11.0409C8.74875 10.4678 8.28091 9.99998 7.70781 9.99998Z" fill="currentColor" />
    <path d="M10.0119 14.5497C10.4096 14.5497 11.7663 14.5029 12.4797 13.7895C12.585 13.6842 12.585 13.5204 12.5031 13.4035C12.3979 13.2982 12.2224 13.2982 12.1172 13.4035C11.661 13.8479 10.7137 14.0117 10.0236 14.0117C9.33354 14.0117 8.37448 13.8479 7.93003 13.4035C7.82477 13.2982 7.64933 13.2982 7.54407 13.4035C7.4388 13.5088 7.4388 13.6842 7.54407 13.7895C8.24582 14.4912 9.61424 14.5497 10.0119 14.5497Z" fill="currentColor" />
    <path d="M11.2517 11.0409C11.2517 11.614 11.7195 12.0819 12.2926 12.0819C12.8657 12.0819 13.3335 11.614 13.3335 11.0409C13.3335 10.4678 12.8657 9.99998 12.2926 9.99998C11.7195 9.99998 11.2517 10.4678 11.2517 11.0409Z" fill="currentColor" />
    <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM15.2049 8.53799C16.0119 8.53799 16.6669 9.19296 16.6669 9.99998C16.6669 10.5965 16.3043 11.1111 15.8248 11.345C15.8482 11.4854 15.8599 11.6257 15.8599 11.7778C15.8599 14.0234 13.2517 15.8362 10.0236 15.8362C6.79553 15.8362 4.18734 14.0234 4.18734 11.7778C4.18734 11.6257 4.19904 11.4737 4.22243 11.3333C3.70781 11.0994 3.35693 10.5965 3.35693 9.99998C3.35693 9.19296 4.0119 8.53799 4.81892 8.53799C5.20489 8.53799 5.56746 8.70173 5.82477 8.94735C6.83062 8.21051 8.22243 7.75437 9.77799 7.70758L10.5148 4.2222C10.5382 4.15203 10.5733 4.09355 10.6318 4.05846C10.6903 4.02337 10.7604 4.01168 10.8306 4.02337L13.2517 4.53799C13.4154 4.18711 13.7663 3.9532 14.1756 3.9532C14.7487 3.9532 15.2166 4.42103 15.2166 4.99413C15.2166 5.56723 14.7487 6.03507 14.1756 6.03507C13.6142 6.03507 13.1581 5.59062 13.1347 5.04092L10.971 4.58478L10.3043 7.70758C11.8248 7.76606 13.2049 8.2339 14.199 8.94735C14.4563 8.69004 14.8072 8.53799 15.2049 8.53799Z" fill="currentColor" />
  </svg>
);

const CopyIcon = () => (
  <svg width="100%" viewBox="0 0 20 20" fill="none">
    <path
      d="M8.33326 10.8333C8.69113 11.3118 9.14772 11.7077 9.67205 11.9941C10.1964 12.2806 10.7762 12.4509 11.3721 12.4936C11.9681 12.5363 12.5662 12.4503 13.126 12.2415C13.6858 12.0327 14.1942 11.7059 14.6166 11.2833L17.1166 8.78334C17.8756 7.9975 18.2956 6.94499 18.2861 5.85251C18.2766 4.76002 17.8384 3.71497 17.0658 2.94243C16.2933 2.1699 15.2482 1.7317 14.1558 1.7222C13.0633 1.71271 12.0108 2.13269 11.2249 2.89168L9.79159 4.31668M11.6666 9.16668C11.3087 8.68824 10.8521 8.29236 10.3278 8.00589C9.80347 7.71943 9.22367 7.54908 8.62771 7.5064C8.03176 7.46372 7.4336 7.54971 6.8738 7.75853C6.314 7.96735 5.80566 8.29412 5.38326 8.71668L2.88326 11.2167C2.12426 12.0025 1.70429 13.055 1.71378 14.1475C1.72327 15.24 2.16148 16.2851 2.93401 17.0576C3.70655 17.8301 4.7516 18.2683 5.84408 18.2778C6.93657 18.2873 7.98908 17.8673 8.77492 17.1083L10.1999 15.6833"
      stroke="currentColor"
      strokeWidth="1.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- Types ---

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface BlogArticleAuthor {
  name: string;
  role: string;
  image: ImageSource;
  bio?: string;
}

interface BlogArticleClientProps {
  id?: string;
  children: React.ReactNode;
  title?: string;
  heroImage?: ImageSource;
  blogHref?: string;
  author?: BlogArticleAuthor;
  date?: string;
  readingTime?: number;
  blogLabel?: string;
  tocLabel?: string;
  shareLabel?: string;
  copyLinkLabel?: string;
  copiedLabel?: string;
  aboutAuthorLabel?: string;
}

// --- Share Buttons ---

const shareBtnClass =
  'w-[2.625rem] h-[2.625rem] flex items-center justify-center border rounded-lg border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors p-2.5 cursor-pointer';

function ShareButtons({
  onCopyLink,
  onShareLinkedIn,
  onShareFacebook,
  onShareX,
  onShareReddit,
  copyLabel,
  copied,
  copiedLabel,
}: {
  onCopyLink: () => void;
  onShareLinkedIn: () => void;
  onShareFacebook: () => void;
  onShareX: () => void;
  onShareReddit: () => void;
  copyLabel: string;
  copied: boolean;
  copiedLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={onCopyLink} className={shareBtnClass} aria-label={copyLabel} title={copied ? copiedLabel : copyLabel}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <button onClick={onShareLinkedIn} className={shareBtnClass} aria-label="Share on LinkedIn">
        <LinkedInIcon />
      </button>
      <button onClick={onShareFacebook} className={shareBtnClass} aria-label="Share on Facebook">
        <FacebookIcon />
      </button>
      <button onClick={onShareX} className={shareBtnClass} aria-label="Share on X">
        <XIcon />
      </button>
      <button onClick={onShareReddit} className={shareBtnClass} aria-label="Share on Reddit">
        <RedditIcon />
      </button>
    </div>
  );
}

// --- Main Component ---

export function BlogArticleClient({
  id,
  children,
  title,
  heroImage,
  blogHref = '/blog',
  author,
  date,
  readingTime,
  blogLabel = 'Blog',
  tocLabel = 'In this article',
  shareLabel = 'Share article',
  copyLinkLabel = 'Copy link',
  copiedLabel = 'Copied',
  aboutAuthorLabel = 'About the Author',
}: BlogArticleClientProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [activeH2Id, setActiveH2Id] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract headings from rendered content
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const rafId = requestAnimationFrame(() => {
      const headings = el.querySelectorAll('h2, h3');
      const items: TocItem[] = [];
      headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        if (!text || heading.hasAttribute('data-toc-exclude')) return;
        if (!heading.id) {
          heading.id =
            text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || '';
        }
        items.push({ id: heading.id, title: text, level: heading.tagName === 'H2' ? 2 : 3 });
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
            const entryId = entry.target.id;
            setActiveId(entryId);
            const tocItem = tocItems.find((t) => t.id === entryId);
            if (tocItem?.level === 2) {
              setActiveH2Id(entryId);
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

  const scrollToHeading = useCallback((headingId: string) => {
    const el = document.getElementById(headingId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  // Social sharing
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title || '';
  const openShare = (url: string) => window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
  const shareLinkedIn = () => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
  const shareFacebook = () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  const shareX = () => openShare(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`);
  const shareReddit = () => openShare(`https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const shareProps = {
    onCopyLink: copyLink,
    onShareLinkedIn: shareLinkedIn,
    onShareFacebook: shareFacebook,
    onShareX: shareX,
    onShareReddit: shareReddit,
    copyLabel: copyLinkLabel,
    copied,
    copiedLabel,
  };

  return (
    <article id={id} className="pt-16">
      {/* Breadcrumb + Title + Meta */}
      <div className="mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)] flex flex-col gap-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center" aria-label="Home">
                <Home className="w-5 h-5" />
              </a>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
            </li>
            <li>
              <a href={blogHref} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                {blogLabel}
              </a>
            </li>
            {title && (
              <>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </li>
                <li>
                  <span className="text-sm font-semibold text-muted-foreground">{title}</span>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Title */}
        {title && (
          <h1 className="text-[clamp(2rem,1.7rem+1.5vw,3rem)] leading-[1.3] font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h1>
        )}

        {/* Date + Reading Time */}
        {(formattedDate || readingTime) && (
          <div className="flex items-center gap-3">
            {formattedDate && <span className="text-base text-foreground">{formattedDate}</span>}
            {formattedDate && readingTime && readingTime > 0 && <span className="w-px h-3.5 bg-border" />}
            {readingTime && readingTime > 0 && <span className="text-base text-foreground">{readingTime} min read</span>}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)] border-b border-border">
        <div className="h-[clamp(2.5rem,2rem+2.5vw,4rem)]" />
        <div className="flex flex-col lg:flex-row gap-[clamp(2rem,1.7rem+1.5vw,3rem)]">
          {/* Content */}
          <div className="min-w-0 flex-1 max-w-[53.25rem]" ref={contentRef}>
            {heroImage && (
              <ThemeImage
                src={heroImage}
                alt={title || 'Blog article'}
                className="w-full h-auto object-cover mb-10 rounded-2xl"
              />
            )}
            <div className="blog-content">
              {children}
            </div>

            {/* About the Author — below content */}
            {author && (
              <section className="bg-muted p-8 rounded-2xl flex flex-col gap-5 mt-12">
                <p className="text-lg font-semibold text-foreground">{aboutAuthorLabel}</p>
                <div className="flex items-center gap-4">
                  {author.image && (
                    <ThemeImage
                      src={author.image}
                      alt={author.name}
                      className="w-[clamp(2.75rem,2.1rem+3vw,4.5rem)] h-[clamp(2.75rem,2.1rem+3vw,4.5rem)] rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{author.name}</p>
                    {author.role && <p className="text-sm text-muted-foreground">{author.role}</p>}
                  </div>
                </div>
                {author.bio && <p className="text-base text-muted-foreground leading-normal">{author.bio}</p>}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-full max-w-[16rem] xl:max-w-[19.75rem] shrink-0">
            <div className="sticky top-24 flex flex-col gap-5">
              {/* TOC */}
              {tocItems.length > 0 && (
                <div>
                  <p className="font-medium text-foreground mb-4">{tocLabel}</p>
                  <ul className="flex flex-col gap-2">
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
                              'flex items-center gap-2 w-full cursor-pointer text-left',
                              isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
                            )}
                          >
                            <span className={cn('w-3 h-px shrink-0 transition-colors', isActive ? 'bg-foreground' : 'bg-muted-foreground/40')} />
                            <span className="text-sm leading-snug line-clamp-1">{item.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Divider */}
              {tocItems.length > 0 && <hr className="border-border" />}

              {/* Author */}
              {author && (
                <div>
                  {author.image && (
                    <ThemeImage
                      src={author.image}
                      alt={author.name}
                      className="w-14 h-14 rounded-full object-cover mb-4"
                    />
                  )}
                  <p className="text-base font-medium text-foreground">{author.name}</p>
                  {author.role && <p className="text-sm text-muted-foreground">{author.role}</p>}
                </div>
              )}

              {/* Divider */}
              {author && <hr className="border-border" />}

              {/* Share */}
              <div className="flex flex-col gap-4">
                <p className="text-base font-medium text-foreground">{shareLabel}</p>
                <ShareButtons {...shareProps} />
              </div>
            </div>
          </aside>
        </div>
        <div className="h-[clamp(2.5rem,2rem+2.5vw,4rem)]" />
      </div>

      {/* Mobile share bar */}
      <div className="lg:hidden mx-auto w-full max-w-[76rem] px-[clamp(1rem,3vw,3rem)] mt-8 mb-8">
        <div className="flex flex-col gap-4">
          <p className="text-base font-medium text-foreground">{shareLabel}</p>
          <ShareButtons {...shareProps} />
        </div>
      </div>
    </article>
  );
}
