declare module '@shipsite/core/generate-slug-map' {
  export function generateSlugMap(
    rootDir: string,
  ): Record<string, Record<string, string>>;
}
