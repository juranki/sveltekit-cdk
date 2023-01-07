# @sveltekit-cdk/adapter

[![npm version](https://badge.fury.io/js/@sveltekit-cdk%2Fadapter.svg)](https://badge.fury.io/js/@sveltekit-cdk%2Fadapter)

> ### WARNING: Not for production, yet!!
>
> No compatibility between versions is garanteed while in [initial development](https://semver.org/#spec-item-4). It's recommended to use exact version in `package.json` to avoid suprices. 

## Intro

Prepare the artifacts for your SvelteKit site using this adapter.

Then use `SvelteDistribution` construct from  [@sveltekit-cdk/constructsv2](https://github.com/juranki/sveltekit-cdk/tree/main/packages/constructsv2#readme)
to include the site to your CDK stack.

## Instructions

1. In sveltekit project:
    ```bash
    > npm i -s @sveltekit-cdk/adapter
    ```
2. In `svelte.config.js`
    ```javascript
    import preprocess from 'svelte-preprocess';
    import { adapter } from '@sveltekit-cdk/adapter'

    const config = {
        preprocess: preprocess(),

        kit: {
            // hydrate the <div id="svelte"> element in src/app.html
            target: '#svelte',
            adapter: adapter({
                cdkProjectPath: '../the-cdk-project'
            })
        }
    };

    export default config;
    ```


### Links

- [API reference](https://juranki.github.io/sveltekit-cdk/modules/_sveltekit_cdk_adapter.html)
- [Changelog](https://github.com/juranki/sveltekit-cdk/blob/main/packages/adapter/CHANGELOG.md)

