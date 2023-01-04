# @sveltekit-cdk/constructsv2

## 0.5.0

### Minor Changes

- dccc547: build only commonjs package

### Patch Changes

- 3931799: update cdk versions and remove unused deps

## 0.4.0

### Minor Changes

- fix handling of request headers

## 0.3.5

### Patch Changes

- set tsc target to es2020

## 0.3.4

### Patch Changes

- upgrade lambda runtime (14 -> 16)

## 0.3.3

### Patch Changes

- add client address provider

## 0.3.2

### Patch Changes

- 7399f8f: Allow CDK tokens (values that are evaluated during deploy) in renderer environment

## 0.3.1

### Patch Changes

- fix routing for /index.svelte when it's not prerendered

## 0.3.0

### Major Changes

- BREAKING: Drop support for CDK v1
- BREAKING: only support one configuration of CloudFront, Lambda@Edge and S3

### Patch Changes

- Solve problems with prerendered pages

## 0.2.5

### Patch Changes

- set distribution defaultRootObject to index.html

## 0.2.4

### Patch Changes

- revert lambda@edge memory increase

## 0.2.3

### Patch Changes

- increase lambda@edge ssr timeout and memory

## 0.2.2

### Patch Changes

- add distribution function -prop to be able to grant permissions to lambda@edge ssr

## 0.2.1

### Patch Changes

- add tag that is recognized by aws construct hub

## 0.2.0

### Minor Changes

- Implement CDK v2 variant of @sveltekit-cdk/constructs
