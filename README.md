# SvelteKit CDK Adapter

> ### WARNING: Not maintained
>
> Have a look at [SST](https://docs.sst.dev/) instead.


> ### WARNING: Not for production, yet!!
>
> No compatibility between versions is garanteed while in [initial development](https://semver.org/#spec-item-4). It's recommended to use exact version in `package.json` to avoid suprices. 

This repo contains tooling to deploy SvelteKit sites to AWS using CDK.

Tools are split to two packages: **adapter** that plugs into the sveltekit project, and 
**constructs** that are imported to CDK project to integrate SvelteKit site to other parts
of your system.

- **[@sveltekit-cdk/adapter](https://github.com/juranki/sveltekit-cdk/tree/main/packages/adapter#readme)** 
  - plugs into the sveltekit project and makes site available to be consumed in CDK stacks
  - [![npm version](https://badge.fury.io/js/@sveltekit-cdk%2Fadapter.svg)](https://badge.fury.io/js/@sveltekit-cdk%2Fadapter)

-  **[@sveltekit-cdk/constructsv2](https://github.com/juranki/sveltekit-cdk/tree/main/packages/constructsv2#readme)** 
   - SvelteDistribution construct bundles and deploys the site to Lambda@Edge and S3, and distributes it with CloudFront
   - [![npm version](https://badge.fury.io/js/@sveltekit-cdk%2Fconstructsv2.svg)](https://badge.fury.io/js/@sveltekit-cdk%2Fconstructsv2)

![](https://user-images.githubusercontent.com/6607/153542454-250fc3c6-7c83-401a-aade-73e03939ac2e.png)
## Howto

**TODO: fill in details**

1. init sveltekit project
2. init cdk project
3. add adapter to sveltekit project and point it to cdk project
4. add constructs to cdk project
5. optionally edit cdk stacks to
   - hook site up with other resources
   - add custom domain and certificate
   - adjust capacity allocation
   - ...

## Status

- In initial development, API IS NOT STABLE!
- I feel quite confident about overall structure
- Areas of uncertainty that are likely to cause significant changes (== opinions, feedback and advice appreciated)
  - ~~how to design constructs to be both intuitive and flexible; how much flexibility is really needed~~ **(2022-02-12: focus on ease or use and robustness, even at the expence of flexibility)**
  - ~~dependency management of constructs: cdk moves fast, v1 and v2 have different approaches to packaging and versioning~~ **(2022-02-12: only support v2)** 
  - ~~adapter interface of sveltekit might still change a little~~

### Links

- [API reference](https://juranki.github.io/sveltekit-cdk/)
- [@sveltekit-cdk/adapter changelog](https://github.com/juranki/sveltekit-cdk/blob/main/packages/adapter/CHANGELOG.md)
- [@sveltekit-cdk/constructsv2 changelog](https://github.com/juranki/sveltekit-cdk/blob/main/packages/constructsv2/CHANGELOG.md)
