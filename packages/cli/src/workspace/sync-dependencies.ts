import { join } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

/** Dependencies required by analytics features */
const ANALYTICS_DEPS: Record<string, { pkg: string; version: string }> = {
  vercel: { pkg: '@vercel/analytics', version: '^1.5.0' },
  googleTagManager: { pkg: '@next/third-parties', version: '^15.0.0' },
};

/**
 * Ensures the user's package.json contains all dependencies required
 * by the current shipsite.json config, and installs any missing ones.
 */
export function syncDependencies(rootDir: string, config: Record<string, unknown>): void {
  const pkgPath = join(rootDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const deps: Record<string, string> = pkg.dependencies || {};

  const missing: { pkg: string; version: string }[] = [];
  const analytics = config.analytics as Record<string, unknown> | undefined;

  if (analytics) {
    for (const [key, dep] of Object.entries(ANALYTICS_DEPS)) {
      if (analytics[key] && !deps[dep.pkg]) {
        missing.push(dep);
      }
    }
  }

  if (missing.length === 0) return;

  const installArgs = missing.map((d) => `${d.pkg}@${d.version}`).join(' ');
  console.log(`  Installing missing dependencies: ${missing.map((d) => d.pkg).join(', ')}...`);
  execSync(`npm install ${installArgs}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
}
