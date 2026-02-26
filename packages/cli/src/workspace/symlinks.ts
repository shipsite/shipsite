import { join } from 'path';
import { existsSync, symlinkSync } from 'fs';

export function createSymlinks(rootDir: string, shipSiteDir: string): void {
  // node_modules — required so Turbopack/Next.js can resolve packages
  // from within the .shipsite workspace (which has its own package.json boundary)
  const nodeModulesLink = join(shipSiteDir, 'node_modules');
  if (!existsSync(nodeModulesLink) && existsSync(join(rootDir, 'node_modules'))) {
    symlinkSync(join(rootDir, 'node_modules'), nodeModulesLink);
  }

  // Content directory (required)
  const contentLink = join(shipSiteDir, 'content');
  if (!existsSync(contentLink)) {
    symlinkSync(join(rootDir, 'content'), contentLink);
  }

  // Public directory (optional)
  const publicLink = join(shipSiteDir, 'public');
  if (!existsSync(publicLink) && existsSync(join(rootDir, 'public'))) {
    symlinkSync(join(rootDir, 'public'), publicLink);
  }

  // Custom components directory (optional)
  const componentsLink = join(shipSiteDir, 'components');
  if (!existsSync(componentsLink) && existsSync(join(rootDir, 'components'))) {
    symlinkSync(join(rootDir, 'components'), componentsLink);
  }
}
