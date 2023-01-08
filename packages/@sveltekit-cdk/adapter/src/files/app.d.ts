declare module 'SERVER' {
	export { Server } from '@sveltejs/kit';
}

declare module 'MANIFEST' {
	import { SSRManifest } from '@sveltejs/kit';

	export const manifest: SSRManifest;
}

declare module 'PRERENDERED' {
	export const prerenderedPages: { [route: string]: string }
}
