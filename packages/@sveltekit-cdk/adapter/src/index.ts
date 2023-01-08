import { writeFileSync, renameSync } from 'fs';
import * as path from 'path';
import type { Adapter, Builder } from '@sveltejs/kit';
import { SvelteKitCDKArtifact } from '@sveltekit-cdk/artifact';
import { build } from 'esbuild';

export interface AdapterParams {
  /**P
   * Location of CDK project.
   *
   * One of `cdkProjectPath` or `artifactPath` is required.
   */
  cdkProjectPath?: string;
  /**
   * Path to store sveltekit artifacts.
   *
   * One of `cdkProjectPath` or `artifactPath` is required.
   *
   * @default ${cdkProjectPath}/sveltekit
   */
  artifactPath?: string;
}

/**
 * Returns adapter that prepares SvelteKit site for deployment with AWS CDK V2
 */
export function adapter({ cdkProjectPath, artifactPath }: AdapterParams): Adapter {
  if (!cdkProjectPath && !artifactPath) {
    throw new Error('at least one of cdkProjectPath or artifactPath is required');
  }
  return {
    name: 'sveltekit-cdk-adapter',
    async adapt(builder): Promise<void> {

      // Prepare code for lambda function
      const lambdaPath = builder.getBuildDirectory('@sveltekit-cdk');
      builder.rimraf(lambdaPath);
      builder.mkdirp(lambdaPath);

      const files = path.join(__dirname, 'files');
      builder.copy(files, lambdaPath, {
        replace: {
          SERVER: '../output/server/index',
          MANIFEST: '../output/server/manifest',
          PRERENDERED: './prerendered',
        },
      });
      writePrerenderedTs(lambdaPath, builder);

      // Prepare artifact for CDK deployment
      const targetPath = artifactPath || path.join(cdkProjectPath!, 'sveltekit');
      builder.rimraf(targetPath);

      const artifact = new SvelteKitCDKArtifact(targetPath);
      artifact.subdirectories.forEach((p) => builder.mkdirp(p));

      builder.writePrerendered(artifact.staticPath);
      const staticFiles = builder.writeClient(artifact.staticPath);
      artifact.staticGlobs = staticGlobs(staticFiles);

      // UGLY WORKAROUND FOR CF/S3 ROUTING FOR FILES WITH + IN PATH
      for (let filename of staticFiles.filter(f => f.includes('+'))) {
        const newFilename = filename.replaceAll('+', ' ');
        renameSync(path.join(artifact.staticPath, filename), path.join(artifact.staticPath, newFilename));
      }

      await build({
        entryPoints: [path.join(lambdaPath, 'at-edge-handler.js')],
        outfile: path.join(artifact.lambdaPath, 'at-edge-handler.js'),
        bundle: true,
        platform: 'node',
        inject: [path.join(lambdaPath, 'shims.js')],
        external: ['./settings'],
      });

      artifact.write();

      builder.log(`CDK artifact was written to ${targetPath}`);
    },
  };
}

/**
 * Returns a list of glob patterns that can be used for
 * creating CloudFront behaviours for serving static content
 *
 * @param staticFiles
 */
function staticGlobs(staticFiles: string[]): string[] {
  const globs: { [glob: string]: boolean } = {};
  staticFiles.forEach(p => {
    const ps = p.split('/');
    const glob = ps.length > 1 ? `${ps[0]}/*` : p;
    globs[glob] = true;
  });
  return Object.keys(globs);
}

function writePrerenderedTs(targetPath: string, builder: Builder) {
  const prerenderedPages: { [route: string]: string } = {};
  builder.prerendered.pages.forEach((v, k) => {
    prerenderedPages[k] = v.file;
  });
  writeFileSync(
    targetPath,
    [
      `export const prerenderedPages = ${JSON.stringify(prerenderedPages)}`,
    ].join('\n'),
  );
}
