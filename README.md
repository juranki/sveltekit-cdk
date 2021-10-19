# SvelteKit CDK Adapter

## WARNING: Not for production use!!

**At the moment, below is more wishful thinking than factual description of existing functionality**

This repo contains tooling to deploy SvelteKit sites to AWS using CDK.

Two packages are provided:
- **sveltekit-cdk-adapter**
  - [x] makes sveltekit artifacts available to be consumed in CDK stacks
  - [ ] optionally deploys a CDK stack after producing the artifacts
- **sveltekit-cdk-constructs**
  - [ ] cloudfront distribution for static content
  - [ ] lambda backend for ssr and endpoints
  - [ ] ecs backend for ssr and endpoints
