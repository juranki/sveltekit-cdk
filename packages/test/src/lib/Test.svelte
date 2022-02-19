<script lang="ts">
    import type { Test } from '$lib/test/types'
    export let test:Test
</script>

{#if test}
  <section class={test.status}>
    <h2>{test.title}</h2>
    <div>{test.status}</div>
    <p>{test.description}</p>
    {#if test.error}
      <pre>{test.error}</pre>
    {/if}
  </section>
{/if}

<style>
  section {
    position: relative;
    border: 3px solid #eeeeee;
    padding: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
  section.failure {
    border: 3px solid #ad2c2c;
  }
  section.running {
    border: 3px solid #a4ad2c;
  }
  section.success {
    border: 3px solid #2cad2c;
  }
  div {
    position: absolute;
    top: 0.3rem;
    right: 0.3rem;
  }
  h2 {
      margin-top: 0.3rem;
  }
  pre {
      padding: 0.3rem;
      background-color: #eedada;
  }
</style>
