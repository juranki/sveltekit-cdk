import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

/**
 * SvelteKitCDKArtifact defines how SvelteKit build
 * artifacts are stored in filesystem.
 */
export class SvelteKitCDKArtifact {
  readonly version = 1;
  readonly metaPath: string;
  readonly staticPath: string;
  readonly lambdaPath: string;

  /**
   * List of glob patterns for routing static content.
   */
  public staticGlobs: string[] = [];
  public prerenderedRoutes: string[] = [];

  constructor(basePath: string) {
    this.staticPath = path.join(basePath, 'static');
    this.lambdaPath = path.join(basePath, 'lambda');
    this.metaPath = path.join(basePath, 'meta.json');
  }

  get subdirectories(): string[] {
    return [
      this.staticPath,
      this.lambdaPath,
    ].copyWithin(3, 0);
  }

  write() {
    writeFileSync(this.metaPath, JSON.stringify({
      version: this.version,
      staticGlobs: this.staticGlobs,
    }, null, 2));
  }

  read() {
    const json = readFileSync(this.metaPath, { encoding: 'utf-8' });
    const o = JSON.parse(json);
    if (o.version !== this.version) {
      throw new Error(`invalid artifact version ${o.version} (expected ${this.version})`);
    }
    this.staticGlobs = o.staticGlobs;
  }
}