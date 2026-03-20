#!/usr/bin/env node

import * as p from '@clack/prompts';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { execSync, spawn } from 'child_process';
import { createRequire } from 'module';
import { generateProjectFiles } from './scaffold.js';

const require = createRequire(import.meta.url);
const { version: ownVersion } = require('../package.json');

/** Fetch the latest published version of @shipsite.dev/cli from npm. */
function getLatestVersion(): string {
  try {
    return execSync('npm view @shipsite.dev/cli version', { encoding: 'utf-8', timeout: 10_000 }).trim();
  } catch {
    return ownVersion;
  }
}

async function main() {
  console.log();
  p.intro(`Create a new ShipSite project (v${ownVersion})`);

  const projectName = (await p.text({
    message: 'Project name',
    placeholder: 'my-website',
    validate: (value) => {
      if (!value) return 'Project name is required';
      if (existsSync(resolve(value))) return 'Directory already exists';
    },
  })) as string;

  if (p.isCancel(projectName)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  const templateChoice = (await p.select({
    message: 'Which template do you want to use?',
    options: [
      { value: 'shipsite', label: 'ShipSite Design', hint: 'Pre-built components, header, footer, theme — ready to go' },
      { value: 'custom', label: 'Custom Design', hint: 'Blank canvas — bring your own layout, components, and styles' },
    ],
    initialValue: 'shipsite',
  })) as 'shipsite' | 'custom';

  if (p.isCancel(templateChoice)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  let primaryColor = '#059669';
  if (templateChoice === 'shipsite') {
    primaryColor = (await p.text({
      message: 'Primary color (hex)',
      placeholder: '#059669',
      initialValue: '#059669',
    })) as string;

    if (p.isCancel(primaryColor)) {
      p.cancel('Cancelled');
      process.exit(0);
    }
  }

  const localesResult = (await p.multiselect({
    message: 'Which languages do you need?',
    options: [
      { value: 'en', label: 'English', hint: 'default' },
      { value: 'de', label: 'German' },
      { value: 'fr', label: 'French' },
      { value: 'es', label: 'Spanish' },
    ],
    required: true,
    initialValues: ['en'],
  })) as string[];

  if (p.isCancel(localesResult)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  const locales = localesResult;

  const s = p.spinner();
  s.start('Creating project...');

  const version = getLatestVersion();
  const projectDir = resolve(projectName);

  // Generate all project files in-memory
  const files = generateProjectFiles({
    projectName,
    template: templateChoice,
    primaryColor,
    locales,
    cliVersion: version,
  });

  // Write files to disk
  for (const file of files) {
    const filePath = join(projectDir, file.path);
    mkdirSync(dirname(filePath), { recursive: true });
    if (file.encoding === 'base64') {
      writeFileSync(filePath, Buffer.from(file.content, 'base64'));
    } else {
      writeFileSync(filePath, file.content);
    }
  }

  s.stop('Project created!');

  // Initialize git
  try {
    execSync('git init', { cwd: projectDir, stdio: 'ignore' });
    p.log.success('Initialized git repository');
  } catch {
    // Git not available
  }

  // Install dependencies (async so the spinner stays animated)
  const installSpinner = p.spinner();
  installSpinner.start('Installing dependencies...');
  const installStart = Date.now();
  const installTimer = setInterval(() => {
    const elapsed = Math.round((Date.now() - installStart) / 1000);
    installSpinner.message(`Installing dependencies... (${elapsed}s)`);
  }, 1000);
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn('npm', ['install'], { cwd: projectDir, stdio: 'ignore' });
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
      child.on('error', reject);
    });
    clearInterval(installTimer);
    const totalSeconds = Math.round((Date.now() - installStart) / 1000);
    installSpinner.stop(`Dependencies installed (${totalSeconds}s)`);
  } catch {
    clearInterval(installTimer);
    installSpinner.stop('Failed to install dependencies');
    p.log.warning('Run `npm install` manually to install dependencies.');
  }

  p.note(
    [`cd ${projectName}`, 'npx shipsite dev'].join('\n'),
    'Next steps',
  );

  p.outro('Happy shipping!');
}

main().catch(console.error);
