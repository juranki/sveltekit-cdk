# sveltekit-cdk-constructs

## 0.7.5

### Patch Changes

- set distribution defaultRootObject to index.html

## 0.7.4

### Patch Changes

- revert lambda@edge memory increase

## 0.7.3

### Patch Changes

- increase lambda@edge ssr timeout and memory

## 0.7.2

### Patch Changes

- add distribution function -prop to be able to grant permissions to lambda@edge ssr

## 0.7.1

### Patch Changes

- add tag that is recognized by aws construct hub

## 0.7.0

### Minor Changes

- Add ability to set domains and certificate to CloudFront distribution (contributed by KayoticSully)
- Update constructs to work with the latest cdk version (contributed by KayoticSully)

## 0.6.0

### Minor Changes

- inject environment variables to lambda@edge adapter

## 0.5.0

### Minor Changes

- add options to attach renderer to viewer or origin request events
- hardcode simple stack config

### Patch Changes

- exclude externals from api doc

## 0.4.0

### Minor Changes

- Add option to deploy rendered as Lambda@Edge function that is
  attached to the distribution.

  Caused some refactoring in constructs and definately broke the API.
  Api still doesn't feel right, so expect more of that.

## 0.3.1

### Patch Changes

- 5ba4e28: update package info for npm

## 0.3.0

### Minor Changes

- 7670aea: expose distribution configuration

## 0.2.0

### Minor Changes

- This is initial release, which provides just enough functionality to deploy the demo site.
