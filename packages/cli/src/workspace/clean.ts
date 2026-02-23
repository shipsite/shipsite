import { rmSync, mkdirSync } from 'fs';

export function cleanWorkspace(shipSiteDir: string): void {
  rmSync(shipSiteDir, { recursive: true, force: true });
  mkdirSync(shipSiteDir, { recursive: true });
}
