<script lang="ts">
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  import { getSocketIO } from "$lib/websocket";
  let deviceSupported: boolean;

  function deviceIsSupported(): boolean {
    return ("NDEFReader" in window && window.isSecureContext) || dev;
  }

  function createLobby() {
    getSocketIO();
  }

  onMount(() => {
    deviceSupported = deviceIsSupported();
  });
</script>

<div class="min-h-screen flex flex-col justify-between items-center py-10 px-2">
  {#if deviceSupported}
    <div class="text-5xl">Cyber Spy</div>
    <div>
      <MainButton on:click={() => createLobby()}>Create Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
