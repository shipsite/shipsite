import { join, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Resolve the next binary path by walking up from rootDir.
 * Returns the absolute path to the next binary, or falls back to 'npx'.
 */
export function resolveNextBin(rootDir: string): { command: string; args: string[] } {
  let searchDir = rootDir;
  for (let i = 0; i < 10; i++) {
    const candidate = join(searchDir, 'node_modules', '.bin', 'next');
    if (existsSync(candidate)) {
      return { command: candidate, args: [] };
    }
    const parent = dirname(searchDir);
    if (parent === searchDir) break;
    searchDir = parent;
  }
  return { command: 'npx', args: ['next'] };
}
