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
        async adapt({ utils, config }): Promise<void> {

            const targetPath = artifactPath || path.join(cdkProjectPath!, 'sveltekit')
            const files = path.join(__dirname, 'files');
            const dirs = {
                static: path.join(targetPath, 'static'),
                lambda: path.join(targetPath, 'lambda'),
                server: path.join(targetPath, 'server'),
            }

            utils.rimraf(targetPath)
            utils.rimraf('.svelte-kit/cdk')

            await utils.prerender({
                dest: dirs.static
            });
            utils.copy_client_files(dirs.static)
            utils.copy_static_files(dirs.static)
            utils.copy(`${files}/`, '.svelte-kit/cdk/')

            await build({
                entryPoints: ['.svelte-kit/cdk/proxy-v2-handler.ts'],
                outfile: path.join(dirs.server, 'proxy-v2/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(files, 'shims.js')]
            })

            await build({
                entryPoints: ['.svelte-kit/cdk/at-edge-handler.ts'],
                outfile: path.join(dirs.server, 'at-edge/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(files, 'shims.js')]
            })

        },
    }
}