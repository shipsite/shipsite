export interface GeneratorContext {
  rootDir: string;
  shipSiteDir: string;
  srcDir: string;
  config: any;
  mode: 'dev' | 'build';
}
