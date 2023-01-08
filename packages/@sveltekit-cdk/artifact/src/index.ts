import { writeFileSync } from 'fs';
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
  public staticGlobs?: string[];

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
}