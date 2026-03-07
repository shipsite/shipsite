#!/usr/bin/env node

/**
 * Postinstall hook — regenerates AI config files after package install/update.
 * Runs only when shipsite.json exists (i.e. inside a shipsite project).
 * Uses INIT_CWD to find the project root (set by npm/pnpm/yarn to the directory
 * where `npm install` was run).
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { generateAiConfig } from './workspace/generators/ai-config.js';

const rootDir = process.env.INIT_CWD || process.cwd();
const configPath = join(rootDir, 'shipsite.json');

if (existsSync(configPath)) {
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    if (!config.i18n) {
      const locales = [...new Set((config.pages || []).flatMap((p: { locales?: string[] }) => p.locales || ['en']))];
      config.i18n = { defaultLocale: locales[0] || 'en', locales, localePrefix: 'as-needed' };
    }

    const ctx = {
      rootDir,
      shipSiteDir: join(rootDir, '.shipsite'),
      srcDir: join(rootDir, '.shipsite', 'src'),
      config,
      mode: 'build' as const,
    };

    generateAiConfig(ctx);
    console.log('  Updated AI config files');
  } catch {
    // Silent fail — don't break npm install
  }
}
