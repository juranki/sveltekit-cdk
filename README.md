# SvelteKit CDK Adapter

## WARNING: Not for production use!!

**At the moment, below is more wishful thinking than factual description of existing functionality**

This repo contains tooling to deploy SvelteKit sites to AWS using CDK.

Package structure is based on assumption that SvelteKit site is part or a larger system,
hosted on AWS and deployed with CDK.

Tools are split to two packages: **adapter** that plugs into the sveltekit project, and 
**constructs** that are imported to CDK project to integrate SvelteKit site to other parts
of your system.

- **sveltekit-cdk-adapter**
  - [x] makes sveltekit artifacts available to be consumed in CDK stacks
  - [ ] optionally deploys a CDK stack after producing the artifacts
- **sveltekit-cdk-constructs**
  - [x] cloudfront distribution for static content
  - [x] lambda backend for ssr and endpoints using api gateway v2
  - [ ] ecs backend for ssr and endpoints using ALB

