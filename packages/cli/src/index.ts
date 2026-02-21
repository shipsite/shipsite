#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'dev': {
      const { dev } = await import('./commands/dev.js');
      await dev();
      break;
    }
    case 'build': {
      const { build } = await import('./commands/build.js');
      await build();
      break;
    }
    case 'add': {
      const { add } = await import('./commands/add.js');
      await add(args.slice(1));
      break;
    }
    default:
      console.log(`
  ShipSite CLI

  Usage:
    shipsite dev                       Start development server
    shipsite build                     Build for production
    shipsite add page <name>           Add a new page
    shipsite add blog <title>          Add a new blog post

  Options:
    --help    Show this help message
    --version Show version
      `);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
