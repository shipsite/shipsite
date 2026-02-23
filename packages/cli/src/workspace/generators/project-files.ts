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
          jsx: 'preserve',
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
        ],
        exclude: ['node_modules'],
      },
      null,
      2,
    ),
  );

  // package.json
  writeFileSync(
    join(ctx.shipSiteDir, 'package.json'),
    JSON.stringify(
      {
        name: 'shipsite-workspace',
        private: true,
        type: 'module',
      },
      null,
      2,
    ),
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
