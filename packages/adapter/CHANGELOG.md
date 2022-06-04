# sveltekit-cdk-adapter

## 0.7.7

### Patch Changes

- adjust to sveltekit changes (sveltejs/kit#4934)

## 0.7.6

### Patch Changes

- add client address provider

## 0.7.5

### Patch Changes

- 7399f8f: Allow CDK tokens (values that are evaluated during deploy) in renderer environment

## 0.7.4

### Patch Changes

- 2cdd82b: adjust to adapter changes (1.0.0-next.282 -> 1.0.0-next.292)

## 0.7.3

### Patch Changes

- fix build on win32

## 0.7.2

### Patch Changes

- a863f90: adjust to breaking changes in @sveltejs/kit@1.0.0-next.280
- 1a10ef9: fix transformation of binary request body
- 4e8a024: fix transformation of binary response body

## 0.7.1

### Patch Changes

- fix routing for /index.svelte when it's not prerendered

## 0.7.0

### Major Changes

- BREAKING: Drop support for CDK v1
- BREAKING: only support one configuration of CloudFront, Lambda@Edge and S3

### Patch Changes

- Solve problems with prerendered pages
- Fix problems with caching of SSR pages
- Block headers that are blacklisted by CloudFront

## 0.6.2

### Patch Changes

- refactor shim handling and adapter compile order
- change package type to esmodule

## 0.6.1

### Patch Changes

- Construct Request object with body

## 0.6.0

### Minor Changes

- Comply with changes in SvelteKit adapter interface (1.0.0-next.240)

## 0.5.0

### Minor Changes

- Adjust to changes in SvelteKit adapter interface (contributed by KayoticSully)

## 0.4.0

### Minor Changes

- inject environment variables to lambda@edge adapter

### Patch Changes

- handle empty response body in lambda@edge adapter

## 0.3.1

### Patch Changes

- log level handling in renderer adapters
- exclude externals from api doc

## 0.3.0

### Minor Changes

- Add option to deploy rendered as Lambda@Edge function that is
  attached to the distribution.

  Caused some refactoring in constructs and definately broke the API.
  Api still doesn't feel right, so expect more of that.

## 0.2.1

### Patch Changes

- 5ba4e28: update package info for npm

## 0.2.0

### Minor Changes

- This is initial release, which provides just enough functionality to deploy the demo site.
