# @sveltekit-cdk/adapter

## WARNING: Not for production use!!

**At the moment, below is more wishful thinking than factual description of existing functionality**

## Intro

Plug this adapter to your SvelteKit project to
copy artifacts to CDK stack, and optionally
and optionally deploy the stack on build.

Use the [@sveltekit-cdk/construct](../constructs)
to specify how SvelteKit is integrated to your
stack.

## Instructions

1. In sveltekit project:
    ```bash
    > npm i -s @sveltekit-cdk/adapter
    ```
2. In `svelte.config.js`
    ```javascript
    import preprocess from 'svelte-preprocess';
    import { AwsServerlessAdapter } from '@sveltekit-cdk/adapter'

    const config = {
        preprocess: preprocess(),

        kit: {
            // hydrate the <div id="svelte"> element in src/app.html
            target: '#svelte',
            adapter: AwsServerlessAdapter({
                cdkProjectPath: '../the-cdk-project'
            })
        }
    };

    export default config;
    ```