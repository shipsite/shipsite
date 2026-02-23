# Contributing to ShipSite

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/shipsite/shipsite.git
cd shipsite
npm install
npm run build
```

### Running the dev server

```bash
cd examples/minimal
npx shipsite dev
```

### Running tests

```bash
npm test
```

## Project Structure

```
packages/
  core/         — Content engine, routing, config, theme
  components/   — React UI components (shadcn/ui based)
  cli/          — `shipsite dev` and `shipsite build` commands
  create-shipsite/ — `npm create shipsite` scaffolder
examples/
  minimal/      — Minimal example site (used for integration tests)
```

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm test` to verify unit tests pass
4. Run `cd examples/minimal && npx shipsite build` to verify the full build works
5. Open a pull request

## Code Style

- TypeScript strict mode
- No unnecessary abstractions — keep it simple
- No added comments unless the logic isn't self-evident
- Prefer editing existing files over creating new ones

## Commit Messages

Keep them short and descriptive. Use imperative mood:

- `Fix slug resolution for localized blog pages`
- `Add dark mode tokens to theme generator`

## Reporting Bugs

Use the [bug report template](https://github.com/shipsite/shipsite/issues/new?template=bug_report.yml). Include your ShipSite version, Node.js version, and steps to reproduce.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
