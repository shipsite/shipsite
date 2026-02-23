import { spawn } from 'child_process';
import { prepareWorkspace } from '../workspace/index.js';
import { resolveNextBin } from '../workspace/resolve-next.js';

export async function dev() {
  const rootDir = process.cwd();

  console.log('\n  Starting ShipSite dev server...\n');

  const shipSiteDir = await prepareWorkspace(rootDir, 'dev');

  console.log('\n  Starting Next.js dev server...\n');
  const { command, args } = resolveNextBin(rootDir);
  const nextDev = spawn(command, [...args, 'dev'], {
    cwd: shipSiteDir,
    stdio: 'inherit',
    env: { ...process.env, SHIPSITE_ROOT: rootDir },
  });

  nextDev.on('close', (code) => {
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    nextDev.kill('SIGINT');
  });
}
