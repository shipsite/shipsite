import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generatePage(ctx: GeneratorContext): void {
  const hasCustomComponents = existsSync(join(ctx.rootDir, 'components'));
  const customComponentsImport = hasCustomComponents
    ? `import * as CustomComponents from '../../../../components';\n`
    : '';
  const allComponentsMerge = hasCustomComponents
    ? 'const AllComponents = { ...mdxHtmlOverrides, ...Components, ...CustomComponents };\n'
    : 'const AllComponents = { ...mdxHtmlOverrides, ...Components };\n';

  writeFileSync(
    join(ctx.srcDir, 'app', '[locale]', '[[...slug]]', 'page.tsx'),
    `import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getPageContent } from '@shipsite.dev/core/mdx';
import { getPageBySlug, generateAllStaticParams, buildCanonicalUrl, getAlternateUrls, isNoIndexPage } from '@shipsite.dev/core/pages';
import { resolveAuthor } from '@shipsite.dev/core/blog';
import { getConfig, getSiteUrl } from '@shipsite.dev/core/config';
import * as Components from '@shipsite.dev/components';
${customComponentsImport}import type { Metadata } from 'next';

// Map shadcn Table components to HTML element names for Markdown tables
const mdxHtmlOverrides = {
  table: Components.Table,
  thead: Components.TableHeader,
  tbody: Components.TableBody,
  th: Components.TableHead,
  tr: Components.TableRow,
  td: Components.TableCell,
};

${allComponentsMerge}
interface PageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export async function generateStaticParams() {
  return generateAllStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const slugPath = slug?.join('/') || '';
  const pageConfig = getPageBySlug(slugPath, locale);
  if (!pageConfig) return {};

  try {
    const { frontmatter } = await getPageContent(pageConfig.content, locale, AllComponents);
    const canonicalUrl = buildCanonicalUrl(locale, slugPath);
    const config = getConfig();
    const languages = getAlternateUrls(pageConfig);

    return {
      title: slugPath === '' ? { absolute: frontmatter.title } : frontmatter.title,
      description: frontmatter.description,
      ...(isNoIndexPage(pageConfig) && { robots: { index: false, follow: true } }),
      alternates: { canonical: canonicalUrl, languages },
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.description,
        url: canonicalUrl,
        siteName: config.name,
        locale,
        type: pageConfig.type === 'blog-article' ? 'article' : 'website',
      },
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const slugPath = slug?.join('/') || '';
  setRequestLocale(locale);

  const pageConfig = getPageBySlug(slugPath, locale);
  if (!pageConfig) notFound();

  let content;
  try {
    const result = await getPageContent(pageConfig.content, locale, AllComponents);
    content = result.content;
  } catch (error) {
    console.error('MDX content error:', error);
    notFound();
  }

  return <div className="page-prose">{content}</div>;
}
`,
  );
}
