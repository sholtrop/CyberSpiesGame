<script lang="ts">
  import { dev } from "$app/environment";
  import DevPanel from "$lib/DevPanel.svelte";
  import { DEV_PANEL_KEY } from "$lib/consts";
  import { lobbyStore } from "$lib/lobbyStore";
  import "../app.postcss";

  let showDevPanel = true;
</script>

<div
  class="bg-black h-screen flex flex-col items-center text-white font-mono py-10 px-2 select-none"
>
  <slot />
</div>

<svelte:window
  on:keydown={(e) => {
    if (e.ctrlKey && e.key === DEV_PANEL_KEY) showDevPanel = !showDevPanel;
  }}
/>
{#if dev && showDevPanel}
  <DevPanel />
{/if}
