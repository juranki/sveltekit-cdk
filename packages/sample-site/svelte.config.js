import preprocess from 'svelte-preprocess';
import {AwsServerlessAdapter} from 'sveltekit-cdk-adapter'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: AwsServerlessAdapter({
			cdkProjectPath: '../sample-stack'
		})
	}
};

export default config;
