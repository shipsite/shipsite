declare module '@shipsite.dev/core/generate-slug-map' {
  export function generateSlugMap(
    rootDir: string,
  ): Record<string, Record<string, string>>;
}
