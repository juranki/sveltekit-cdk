import { adapter } from '@sveltekit-cdk/adapter'
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			cdkProjectPath: '../test-stack'
		}),
	}
};

export default config;
