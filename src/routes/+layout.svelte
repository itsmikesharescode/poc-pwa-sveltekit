<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';

  let { children } = $props();

  $effect(() => {
    if (browser && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', {
        type: 'module'
      });
    }
  });
</script>

{@render children()}
