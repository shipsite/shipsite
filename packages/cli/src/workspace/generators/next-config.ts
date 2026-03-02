import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateNextConfig(ctx: GeneratorContext): void {
  const userNextConfigExtensions = ['ts', 'mjs', 'js'];
  const userNextConfig = userNextConfigExtensions.find((ext) =>
    existsSync(join(ctx.rootDir, `next.config.${ext}`)),
  );

  const userConfigImportPath = userNextConfig === 'ts'
    ? '../next.config'
    : `../next.config.${userNextConfig}`;
  const userConfigImport = userNextConfig
    ? `import userConfig from '${userConfigImportPath}';\n`
    : '';
  const userConfigSpread = userNextConfig ? '  ...userConfig,\n' : '';
  const isExport = process.env.SHIPSITE_OUTPUT === 'export';
  const distDirLine = ctx.mode === 'build' ? "  distDir: '../.next',\n" : '';
  const outputLine = isExport ? "  output: 'export',\n" : '';

  writeFileSync(
    join(ctx.shipSiteDir, 'next.config.ts'),
    `import createNextIntlPlugin from 'next-intl/plugin';
import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from 'next';
${userConfigImport}
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
${userConfigSpread}${outputLine}${distDirLine}  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    resolveAlias: {
      'content-collections': './.content-collections/generated',
    },
  },
};

export default withContentCollections(withNextIntl(nextConfig));
`,
  );
}
