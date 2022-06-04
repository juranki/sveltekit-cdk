import type { Adapter } from '@sveltejs/kit'
import * as path from 'path'
import { build } from 'esbuild'
import { writeFileSync, mkdirSync } from 'fs';

export interface AdapterParams {
    /**
     * Location of CDK project.
     * 
     * One of `cdkProjectPath` or `artifactPath` is required.
     */
    cdkProjectPath?: string
    /**
     * Path to store sveltekit artifacts.
     * 
     * One of `cdkProjectPath` or `artifactPath` is required.
     * 
     * @default ${cdkProjectPath}/sveltekit
     */
    artifactPath?: string
    /**
     * Cloudfront doesn't automatically pass all headers to origin handlers.
     * List the headers your app needs to function.
     * Cloudfront doesn't allow some headers, please check Cloudfront documentation for current limitations.
     */
    headers?: string[]
}

/**
 * Deprecated, use [[adapter]] instead.
 * @deprecated
 */
export function AwsServerlessAdapter(params: AdapterParams): Adapter {
    console.warn('AwsServerlessAdapter is deprecated, please use adapter')
    return adapter(params)
}

/**
 * Returns adapter that prepares SvelteKit site for deployment with AWS CDK V2
 */
export function adapter({
    cdkProjectPath, artifactPath, headers
}: AdapterParams): Adapter {
    if (!cdkProjectPath && !artifactPath) {
        throw new Error("at least one of cdkProjectPath or artifactPath is required");
    }
    return {
        name: 'sveltekit-cdk-adapter',
        async adapt(builder): Promise<void> {
            let dirname = path.dirname(import.meta.url).split('file://')[1]
            if (process.platform === 'win32') {
                // remove first slash from path
                dirname = dirname.substring(1)
            }
            const targetPath = artifactPath || path.join(cdkProjectPath!, 'sveltekit')
            const files = path.join(dirname, 'files');
            const dirs = {
                prerendered: path.join(targetPath, 'prerendered'),
                static: path.join(targetPath, 'static'),
                lambda: path.join(targetPath, 'lambda'),
            }

            builder.rimraf(targetPath)
            builder.rimraf(builder.getBuildDirectory('cdk'))

            const prerendered = builder.writePrerendered(dirs.prerendered)
            const clientfiles = builder.writeClient(dirs.static)
            const staticfiles = builder.writeStatic(dirs.static)

            // get the routes of prerendered pages
            const prerenderedRoutes = prerendered.map(
                f => `/${f.replace(/^index.html$/, '').replace(/\/index.html$/, '').replace(/.html$/, '')}`
            )
            writeFileSync(
                path.join(targetPath, 'prerendered.json'),
                JSON.stringify(prerenderedRoutes),
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
                prerendered, staticfiles, clientfiles
            )
            mkdirSync(builder.getBuildDirectory('cdk'), { recursive: true })
            const copiedFiles = builder.copy(files, builder.getBuildDirectory('cdk'), {
                replace: {
                    SERVER: '../output/server/index',
                    MANIFEST: '../output/server/manifest',
                    PRERENDERED: './prerendered',
                }
            })
            writePrerenderedTs(
                path.join(builder.getBuildDirectory('cdk'), 'prerendered.ts'),
                prerenderedRoutes, builder.config.kit.trailingSlash === 'always',
            )
            await build({
                entryPoints: [path.join(builder.getBuildDirectory('cdk'), 'at-edge-handler.js')],
                outfile: path.join(dirs.lambda, 'at-edge/handler.js'),
                bundle: true,
                platform: 'node',
                inject: [path.join(builder.getBuildDirectory('cdk'), 'shims.js')],
            })
            builder.log(`CDK artifacts were written to ${targetPath}`)
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
    pre.forEach(p => {
        let glob: string
        if (p === 'index.html') {
            glob = '/'
        } else {
            const ps = p.split('/')
            glob = ps.length > 1 ? `${ps[0]}/*` : p
            glob = `/${glob}`
        }
        if (rv[glob] === 'static') {
            throw new Error('CDK Adapter cannot handle top level routes that mix static and pre-rendered content, yet')
        }
        rv[glob] = 'prerendered'
    })

    writeFileSync(path, JSON.stringify(rv, null, 2))
}
function writePrerenderedTs(path: string, pre: string[], createIndex: boolean) {
    writeFileSync(
        path,
        [
            `export const prerendered = [${pre.map(p => `'${p}'`)}]`,
            `export const createIndex = ${createIndex}`
        ].join('\n')
    )
}