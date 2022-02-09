import type { Adapter } from '@sveltejs/kit'
import * as path from 'path'
import { build } from 'esbuild'
import { existsSync, readFileSync, renameSync, rmdirSync, unlinkSync, writeFileSync } from 'fs';

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
            const dirname = path.dirname(import.meta.url).split('file://')[1]
            const targetPath = artifactPath || path.join(cdkProjectPath!, 'sveltekit')
            const files = path.join(dirname, 'files');
            const dirs = {
                static: path.join(targetPath, 'static'),
                lambda: path.join(targetPath, 'lambda'),
            }

            builder.rimraf(targetPath)
            builder.rimraf('.svelte-kit/cdk')

            const prerendered = await builder.prerender({
                dest: dirs.static,
            });
            
            writeFileSync(
                path.join(targetPath, 'prerendered.json'),
                `[${prerendered.paths.map(p => `"${p}"`).join(',')}]`
            )

            prerendered.paths.forEach(p => {
                if (p === '/') return // leave /index.html
                const base = path.join(dirs.static, p)
                const p1 = path.join(base, 'index.html')
                const p2 = `${base}.html`
                console.log(p, p1, p2)
                if(existsSync(p1)) {
                    const data = readFileSync(p1)
                    unlinkSync(p1)
                    rmdirSync(base)
                    writeFileSync(base, data)
                }
                if(existsSync(p2)) {
                    renameSync(p2, base)
                }
            })

            const clientfiles = builder.writeClient(dirs.static)
            const staticfiles = builder.writeStatic(dirs.static)
            writeFileSync(
                path.join(targetPath, 'client.json'),
                `[${clientfiles.map(p => `"${p}"`).join(',')}]`
            )
            writeFileSync(
                path.join(targetPath, 'static.json'),
                `[${staticfiles.map(p => `"${p}"`).join(',')}]`
            )
            builder.copy(`${files}/`, '.svelte-kit/cdk/', {
                replace: {
                    APP: '../output/server/app',
                    MANIFEST: '../output/server/manifest'
                }
            })

            await build({
                entryPoints: ['.svelte-kit/cdk/proxy-v2-handler.js'],
                outfile: path.join(dirs.lambda, 'proxy-v2/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(files, 'shims.js')],
            })

            await build({
                entryPoints: ['.svelte-kit/cdk/at-edge-handler.js'],
                outfile: path.join(dirs.lambda, 'at-edge/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(files, 'shims.js')],
            })

        },
    }
}
