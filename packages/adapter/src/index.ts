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
    /**
     * Cloudfront doen't automatically pass all headers to origin handlers.
     * List the headers your app needs to function.
     * Cloudfront doesn't allow some headers, please check Cloudfront documentation for current limitations.
     */
    headers?: string[]
}

export function AwsServerlessAdapter({
    cdkProjectPath, artifactPath, stackName, headers
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
                prerendered: path.join(targetPath, 'prerendered'),
                static: path.join(targetPath, 'static'),
                lambda: path.join(targetPath, 'lambda'),
            }

            builder.rimraf(targetPath)
            builder.rimraf('.svelte-kit/cdk')

            const prerendered = await builder.prerender({
                dest: dirs.prerendered,
            });
            const clientfiles = builder.writeClient(dirs.static)
            const staticfiles = builder.writeStatic(dirs.static)

            prerendered.paths.forEach(p => {
                if (p === '/') return // leave /index.html
                const base = path.join(dirs.prerendered, p)
                const p1 = path.join(base, 'index.html')
                const p2 = `${base}.html`
                if (existsSync(p1)) {
                    const data = readFileSync(p1)
                    unlinkSync(p1)
                    rmdirSync(base)
                    writeFileSync(base, data)
                }
                if (existsSync(p2)) {
                    renameSync(p2, base)
                }
            })

            writeFileSync(
                path.join(targetPath, 'prerendered.json'),
                `[${prerendered.paths.map(p => `"${p}"`).join(',')}]`
            )
            writeFileSync(
                path.join(targetPath, 'client.json'),
                `[${clientfiles.map(p => `"${p}"`).join(',')}]`
            )
            writeFileSync(
                path.join(targetPath, 'static.json'),
                `[${staticfiles.map(p => `"${p}"`).join(',')}]`
            )
            writeFileSync(
                path.join(targetPath, 'headers.json'),
                `[${(headers || ['accept']).map(h => `"${h.toLowerCase()}"`).join(',')}]`
            )
            writeRoutes(
                path.join(targetPath, 'routes.json'),
                prerendered.paths, staticfiles, clientfiles
            )
            builder.copy(`${files}/`, '.svelte-kit/cdk/', {
                replace: {
                    APP: '../output/server/app',
                    MANIFEST: '../output/server/manifest',
                    PRERENDERED: './prerendered',
                }
            })
            writePrerenderedTs('.svelte-kit/cdk/prerendered.ts', prerendered.paths)

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
export type StaticRoutes = Record<string, 'prerendered' | 'static'>
function writeRoutes(path: string, pre: string[], sta: string[], cli: string[]) {
    const rv: StaticRoutes = {};

    [...sta, ...cli].forEach(p => {
        const ps = p.split('/')
        const glob = ps.length > 1 ? `${ps[0]}/*` : p
        rv[glob] = 'static'
    });
    pre.map(p => p === '/' ? 'index.html' : p.substring(1)).forEach(p => {
        const ps = p.split('/')
        const glob = ps.length > 1 ? `${ps[0]}/*` : p
        if (rv[glob] === 'static') {
            throw new Error('CDK Adapter cannot handle top level routes that mix static and pre-rendered content, yet')
        }
        rv[glob] = 'prerendered'
    })

    writeFileSync(path, JSON.stringify(rv, null, 2))
}
function writePrerenderedTs(path: string, pre: string[]) {
    writeFileSync(
        path,
        `export const prerendered = [${pre.map(p => p === '/' ? "'/index.html'" : `'${p}'`)}]`
    )
}