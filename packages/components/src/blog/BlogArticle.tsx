import React from 'react';

interface BlogArticleProps {
  children: React.ReactNode;
  contentFolder?: string;
}

export function BlogArticle({ children }: BlogArticleProps) {
  return (
    <article className="py-12 md:py-20">
      <div className="container-main max-w-3xl">{children}</div>
    </article>
  );
}
