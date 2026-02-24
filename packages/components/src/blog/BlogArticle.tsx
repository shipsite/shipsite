import React from 'react';
import { BlogArticleClient } from './BlogArticleClient';

interface BlogArticleAuthor {
  name: string;
  role: string;
  image: string;
}

interface BlogArticleProps {
  id?: string;
  children: React.ReactNode;
  contentFolder?: string;
  date?: string;
  readingTime?: number;
  author?: BlogArticleAuthor;
}

export function BlogArticle({ id, children, author, date, readingTime }: BlogArticleProps) {
  return (
    <BlogArticleClient id={id} author={author} date={date} readingTime={readingTime}>
      {children}
    </BlogArticleClient>
  );
}
