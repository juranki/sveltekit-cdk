# sveltekit-cdk-adapter

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
