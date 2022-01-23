import type { Adapter } from '@sveltejs/kit'
import * as path from 'path'
import { build } from 'esbuild'

export interface AwsServerlessAdapterParams {
    /**
     * Location of CDK project. Required for automatic deploy.
     */
    cdkProjectPath?: string
    /**
     * Path to store sveltekit artifacts.
     * 
     * @default ${cdkProjectPath}/sveltekit
     */
    artifactPath?: string
    /**
     * Stack to deploy after producing artifact.
     */
    stackName?: string
}

export function AwsServerlessAdapter({
    cdkProjectPath, artifactPath, stackName
}: AwsServerlessAdapterParams): Adapter {
    if (!cdkProjectPath && !artifactPath) {
        throw new Error("at least one of cdkProjectPath or artifactPath is required");
    }
    if (!cdkProjectPath && stackName) {
        throw new Error("when stackName is specified, cdkProjectPath is mandatory");
    }
    return {
        name: 'sveltekit-cdk-adapter',
        async adapt(builder): Promise<void> {

            const targetPath = artifactPath || path.join(cdkProjectPath!, 'sveltekit')
            const files = path.join(__dirname, 'files');
            const dirs = {
                static: path.join(targetPath, 'static'),
                lambda: path.join(targetPath, 'lambda'),
            }

            builder.rimraf(targetPath)
            builder.rimraf('.svelte-kit/cdk')

            await builder.prerender({
                dest: dirs.static
            });
            builder.writeClient(dirs.static)
            builder.writeStatic(dirs.static)
            builder.copy(`${files}/`, '.svelte-kit/cdk/', {
                replace: {
                    APP: '../output/server/app',
                    MANIFEST: '../output/server/manifest'
                }
            })

            await build({
                entryPoints: ['.svelte-kit/cdk/proxy-v2-handler.ts'],
                outfile: path.join(dirs.lambda, 'proxy-v2/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(files, 'shims.js')]
            })

            await build({
                entryPoints: ['.svelte-kit/cdk/at-edge-handler.ts'],
                outfile: path.join(dirs.lambda, 'at-edge/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(files, 'shims.js')]
            })

        },
    }
}
