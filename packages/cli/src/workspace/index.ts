import { join } from 'path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { cleanWorkspace } from './clean.js';
import { createSymlinks } from './symlinks.js';
import { generateStyles } from './styles.js';
import { generateNextConfig } from './generators/next-config.js';
import { generateContentCollections } from './generators/content-collections.js';
import { generateI18n } from './generators/i18n.js';
import { generateProxy } from './generators/proxy.js';
import { generateLayout } from './generators/layout.js';
import { generatePage } from './generators/page.js';
import { generateSitemapAndRobots } from './generators/sitemap-robots.js';
import { generateProjectFiles } from './generators/project-files.js';
import { generateAiConfig } from './generators/ai-config.js';
import { generateLlmsTxt } from './generators/llms-txt.js';
import { syncDependencies } from './sync-dependencies.js';
import type { GeneratorContext } from './types.js';

export function generateWorkspace({ rootDir, mode }: { rootDir: string; mode: 'dev' | 'build' }): void {
  const config = JSON.parse(readFileSync(join(rootDir, 'shipsite.json'), 'utf-8'));

  // Derive i18n config from pages if not explicitly set
  if (!config.i18n) {
    const locales = [...new Set((config.pages || []).flatMap((p: { locales?: string[] }) => p.locales || ['en']))];
    config.i18n = { defaultLocale: locales[0] || 'en', locales, localePrefix: 'as-needed' };
  }

  const shipSiteDir = join(rootDir, '.shipsite');
  const srcDir = join(shipSiteDir, 'src');

  cleanWorkspace(shipSiteDir);

  // Create directory structure
  mkdirSync(join(srcDir, 'i18n'), { recursive: true });
  mkdirSync(join(srcDir, 'app', '[locale]', '[[...slug]]'), { recursive: true });
  mkdirSync(join(srcDir, 'styles'), { recursive: true });

  createSymlinks(rootDir, shipSiteDir);

  const ctx: GeneratorContext = { rootDir, shipSiteDir, srcDir, config, mode };

  generateNextConfig(ctx);
  generateContentCollections(ctx);
  generateI18n(ctx);
  generateProxy(ctx);
  generateStyles(ctx);
  generateLayout(ctx);
  generatePage(ctx);
  generateSitemapAndRobots(ctx);
  generateProjectFiles(ctx);
  generateAiConfig(ctx);
  generateLlmsTxt(ctx);

  console.log('  Generated .shipsite workspace');
}

export async function prepareWorkspace(rootDir: string, mode: 'dev' | 'build'): Promise<string> {
  const configPath = join(rootDir, 'shipsite.json');
  if (!existsSync(configPath)) {
    console.error('Error: shipsite.json not found in current directory');
    process.exit(1);
  }

  generateWorkspace({ rootDir, mode });

  // Sync analytics dependencies into the user's package.json
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  syncDependencies(rootDir, config);

  // Generate slug map
  const { generateSlugMap } = await import('@shipsite.dev/core/generate-slug-map');
  const shipSiteDir = join(rootDir, '.shipsite');
  const slugMap = generateSlugMap(rootDir);
  writeFileSync(join(shipSiteDir, 'slug-map.json'), JSON.stringify(slugMap, null, 2));
  console.log(`  Generated slug-map.json (${Object.keys(slugMap).length} entries)`);

  return shipSiteDir;
}
