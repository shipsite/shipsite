import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';

export async function build() {
  const rootDir = process.cwd();
  const configPath = join(rootDir, 'shipsite.json');

  if (!existsSync(configPath)) {
    console.error('Error: shipsite.json not found in current directory');
    process.exit(1);
  }

  console.log('\n  Building ShipSite...\n');

  // 1. Validate config
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  console.log(`  Config valid: ${config.name}`);

  // 2. Validate content files
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
    console.error(
      `\n  ${missingFiles} content file(s) missing. Aborting build.`,
    );
    process.exit(1);
  }
  console.log(`  All content files present`);

  // 3. Generate slug map
  const { generateSlugMap } = await import(
    '@shipsite/core/generate-slug-map'
  );
  const shipSiteDir = join(rootDir, '.shipsite');
  const slugMap = generateSlugMap(rootDir);
  writeFileSync(
    join(shipSiteDir, 'slug-map.json'),
    JSON.stringify(slugMap, null, 2),
  );
  console.log(`  Generated slug-map.json`);

  // 4. Build
  console.log('\n  Running next build...\n');
  const nextBuild = spawn('npx', ['next', 'build'], {
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
