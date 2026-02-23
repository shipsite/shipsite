import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateI18n(ctx: GeneratorContext): void {
  const locales = ctx.config.i18n?.locales || ['en'];
  const defaultLocale = ctx.config.i18n?.defaultLocale || 'en';
  const localePrefix = ctx.config.i18n?.localePrefix || 'as-needed';

  writeFileSync(
    join(ctx.srcDir, 'i18n', 'routing.ts'),
    `import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ${JSON.stringify(locales)},
  defaultLocale: '${defaultLocale}',
  localePrefix: '${localePrefix}',
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
`,
  );

  writeFileSync(
    join(ctx.srcDir, 'i18n', 'request.ts'),
    `import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    locale = routing.defaultLocale;
  }
  return { locale, messages: {} };
});
`,
  );
}
