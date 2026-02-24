import React from 'react';
import { BlogArticleClient } from './BlogArticleClient';

interface BlogArticleAuthor {
  name: string;
  role: string;
  image: string;
  bio?: string;
}

interface BlogArticleProps {
  id?: string;
  children: React.ReactNode;
  contentFolder?: string;
  title?: string;
  heroImage?: string;
  blogHref?: string;
  date?: string;
  readingTime?: number;
  author?: BlogArticleAuthor;
  blogLabel?: string;
  tocLabel?: string;
  shareLabel?: string;
  copyLinkLabel?: string;
  copiedLabel?: string;
  aboutAuthorLabel?: string;
}

export function BlogArticle({
  id,
  children,
  title,
  heroImage,
  blogHref,
  author,
  date,
  readingTime,
  blogLabel,
  tocLabel,
  shareLabel,
  copyLinkLabel,
  copiedLabel,
  aboutAuthorLabel,
}: BlogArticleProps) {
  return (
    <BlogArticleClient
      id={id}
      title={title}
      heroImage={heroImage}
      blogHref={blogHref}
      author={author}
      date={date}
      readingTime={readingTime}
      blogLabel={blogLabel}
      tocLabel={tocLabel}
      shareLabel={shareLabel}
      copyLinkLabel={copyLinkLabel}
      copiedLabel={copiedLabel}
      aboutAuthorLabel={aboutAuthorLabel}
    >
      {children}
    </BlogArticleClient>
  );
}
