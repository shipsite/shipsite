import { join } from 'path';
import { writeFileSync } from 'fs';
import type { GeneratorContext } from '../types.js';

export function generateContentCollections(ctx: GeneratorContext): void {
  writeFileSync(
    join(ctx.shipSiteDir, 'content-collections.ts'),
    `import { createContentCollectionsConfig } from '@shipsite.dev/core/content-collections';
export default createContentCollectionsConfig();
`,
  );
}
