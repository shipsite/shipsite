import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { spawn } from 'child_process';
import { prepareWorkspace } from '../workspace/index.js';
import { resolveNextBin } from '../workspace/resolve-next.js';

export async function build() {
  const rootDir = process.cwd();
  const configPath = join(rootDir, 'shipsite.json');

  console.log('\n  Building ShipSite...\n');

  // Validate content files
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  console.log(`  Config valid: ${config.name}`);

  let missingFiles = 0;
  for (const page of config.pages || []) {
    const locales = page.locales || [config.i18n?.defaultLocale || 'en'];
    for (const locale of locales) {
      const mdxPath = join(rootDir, 'content', page.content, `${locale}.mdx`);
      if (!existsSync(mdxPath)) {
        console.error(`  Missing: content/${page.content}/${locale}.mdx`);
        missingFiles++;
      }
    }
  }

  if (missingFiles > 0) {
    console.error(`\n  ${missingFiles} content file(s) missing. Aborting build.`);
    process.exit(1);
  }
  console.log(`  All content files present`);

  const shipSiteDir = await prepareWorkspace(rootDir, 'build');

  console.log('\n  Running next build...\n');
  const { command, args } = resolveNextBin(rootDir);
  const nextBuild = spawn(command, [...args, 'build'], {
    cwd: shipSiteDir,
    stdio: 'inherit',
    env: { ...process.env, SHIPSITE_ROOT: rootDir },
  });

  nextBuild.on('close', (code) => {
    if (code === 0) {
      console.log('\n  Build complete!');
    } else {
      console.error('\n  Build failed');
    }
    process.exit(code || 0);
  });
}
