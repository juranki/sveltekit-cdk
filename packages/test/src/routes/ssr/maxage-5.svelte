<script lang="ts" context="module">
  import type { Load } from "@sveltejs/kit";
  export const load: Load = async (_) => {
    return {
      maxage: 5,
    };
  };
</script>

<h1>This page should be cached for 5 seconds</h1>

<p>
  Rendered at: {new Date().toISOString()}
</p>
