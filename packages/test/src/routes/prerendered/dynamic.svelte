<script lang="ts">
  import { prerendering, browser } from "$app/env";
  import { page } from "$app/stores";
</script>

<h1>SSR page</h1>

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
