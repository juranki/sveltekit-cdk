import { AwsServerlessAdapter } from '@sveltekit-cdk/adapter'
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: AwsServerlessAdapter({
			cdkProjectPath: '../sample-stack'
		}),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		}
	}
};

export default config;
