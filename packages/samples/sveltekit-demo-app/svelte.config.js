// import adapter from '@sveltejs/adapter-auto';
import { adapter } from "@sveltekit-cdk/adapter";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      artifactPath: "../../../sveltekit-demo-artifact",
    }),
  },
};

export default config;
