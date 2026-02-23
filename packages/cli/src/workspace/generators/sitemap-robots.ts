import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateSitemapAndRobots(ctx: GeneratorContext): void {
  writeFileSync(
    join(ctx.srcDir, 'app', 'sitemap.ts'),
    `import sitemap from '@shipsite.dev/core/sitemap';
export default sitemap;
`,
  );

  writeFileSync(
    join(ctx.srcDir, 'app', 'robots.ts'),
    `import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@shipsite.dev/core/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'GoogleOther', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
    ],
    sitemap: getSiteUrl() + '/sitemap.xml',
  };
}
`,
  );
}
