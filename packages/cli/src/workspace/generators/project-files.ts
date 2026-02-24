import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateProjectFiles(ctx: GeneratorContext): void {
  // tsconfig.json
  writeFileSync(
    join(ctx.shipSiteDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'react-jsx',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: {
            '@/*': ['./src/*'],
            'content-collections': ['./.content-collections/generated'],
          },
        },
        include: [
          'next-env.d.ts',
          '**/*.ts',
          '**/*.tsx',
          '.next/types/**/*.ts',
          '.next/dev/types/**/*.ts',
        ],
        exclude: ['node_modules'],
      },
      null,
      2,
    ),
  );

  // package.json
  const pkg: Record<string, unknown> = {
    name: 'shipsite-workspace',
    private: true,
    type: 'module',
  };
  const deps: Record<string, string> = {};
  if (ctx.config.analytics?.vercel) {
    deps['@vercel/analytics'] = '^1.5.0';
  }
  if (ctx.config.analytics?.googleTagManager) {
    deps['@next/third-parties'] = '^15.0.0';
  }
  if (Object.keys(deps).length > 0) {
    pkg.dependencies = deps;
  }
  writeFileSync(
    join(ctx.shipSiteDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
  );

  // postcss.config.mjs
  writeFileSync(
    join(ctx.shipSiteDir, 'postcss.config.mjs'),
    `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`,
  );
}
