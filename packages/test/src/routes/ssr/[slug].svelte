<script lang="ts" context="module">
  export const prerender = true;
</script>

<script lang="ts">
  import { prerendering, browser } from "$app/env";
  import { page } from "$app/stores";
</script>

<h1>Prerendered page</h1>

<p>
  Prerendering: {prerendering}
</p>

<p>
  Browser: {browser}
</p>

<p>
  Slug: {$page.params.slug}
</p>

<p>
  Rendered at: {new Date().toISOString()}
</p>
