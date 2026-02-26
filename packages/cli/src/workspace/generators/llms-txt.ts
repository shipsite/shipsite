import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateLlmsTxt(ctx: GeneratorContext): void {
  // Opt-out check
  if (ctx.config.seo?.llmsTxt === false) return;

  mkdirSync(join(ctx.srcDir, 'app', 'llms.txt'), { recursive: true });
  mkdirSync(join(ctx.srcDir, 'app', 'llms-full.txt'), { recursive: true });

  // /llms.txt route handler
  writeFileSync(
    join(ctx.srcDir, 'app', 'llms.txt', 'route.ts'),
    `import { generateLlmsTxt } from '@shipsite.dev/core/llms-txt';

export function GET() {
  const content = generateLlmsTxt();
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
`,
  );

  // /llms-full.txt route handler
  writeFileSync(
    join(ctx.srcDir, 'app', 'llms-full.txt', 'route.ts'),
    `import { generateLlmsFullTxt } from '@shipsite.dev/core/llms-txt';

export function GET() {
  const content = generateLlmsFullTxt();
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
`,
  );
}
