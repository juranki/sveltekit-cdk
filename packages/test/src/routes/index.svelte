<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  import {
    prerendered,
    prerenderedContentType,
    ssr,
    cookies,
    requestHeaders,
    responseHeaders,
    staticContent,
    caching,
    cacheControl,
  } from "$lib/test";
  import Test from "$lib/Test.svelte";
</script>

<svelte:head>
  <title>SvelteKit Adapter Test</title>
  <meta name="description" content="A test suite that validates the basic functionality of a SvelteKit adapter"/>
</svelte:head>

<h1>Welcome to SvelteKit CDK Adapter test</h1>

<a href="/ssr/prerendered">prerendered page</a>
<Test test={$prerendered} />
<Test test={$prerenderedContentType} />
<Test test={$staticContent} />
<Test test={$ssr} />
<Test test={$caching} />
<Test test={$requestHeaders} />
<Test test={$responseHeaders} />
<Test test={$cookies} />
<Test test={$cacheControl} />
