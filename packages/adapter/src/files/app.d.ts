declare module 'APP' {
	export { App } from '@sveltejs/kit';
}

declare module 'MANIFEST' {
	import { SSRManifest } from '@sveltejs/kit';

	export const manifest: SSRManifest;
	export const prerendered: Set<string>;
}

declare module 'PRERENDERED' {
	export const prerendered: string[]
	export const createIndex: boolean
}