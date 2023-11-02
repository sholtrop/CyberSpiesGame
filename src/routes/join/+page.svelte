<script lang="ts">
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  let deviceSupported: boolean;

  function deviceIsSupported(): boolean {
    return ("NDEFReader" in window && window.isSecureContext) || dev;
  }

  function joinLobby() {
    getSocketIO();
    goto("/lobby", { replaceState: true });
  }

  onMount(() => {
    deviceSupported = deviceIsSupported();
  });
</script>

<div class="h-full flex flex-col justify-between items-center">
  {#if deviceSupported}
    <Title />
    <div>
      <MainButton on:click={() => joinLobby()}>Join Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
