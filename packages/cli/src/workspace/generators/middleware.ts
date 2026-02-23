import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateMiddleware(ctx: GeneratorContext): void {
  const locales = ctx.config.i18n?.locales || ['en'];
  const defaultLocale = ctx.config.i18n?.defaultLocale || 'en';
  const localePrefix = ctx.config.i18n?.localePrefix || 'as-needed';

  writeFileSync(
    join(ctx.srcDir, 'middleware.ts'),
    `import { createShipSiteMiddleware } from '@shipsite.dev/core/middleware';
import slugMap from '../slug-map.json';

const middleware = createShipSiteMiddleware({
  locales: ${JSON.stringify(locales)},
  defaultLocale: '${defaultLocale}',
  localePrefix: '${localePrefix}',
  slugMap: slugMap as Record<string, Record<string, string>>,
});

export default middleware;

// Next.js requires config to be a static object literal (not imported)
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)'],
};
`,
  );
}
