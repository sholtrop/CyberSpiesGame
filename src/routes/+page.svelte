<script lang="ts">
  import { onMount } from "svelte";
  import { dev } from "$app/environment";
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import NameInput from "$lib/NameInput.svelte";
  let deviceSupported: boolean;

  let playerName:string = "";
  let showError:boolean = false;

  function deviceIsSupported(): boolean {
    return ("NDEFReader" in window && window.isSecureContext) || dev;
  }

  function emitPlayerName() {

  }

  function createLobby() {
    if (playerName) {
      getSocketIO();
      emitPlayerName();
      goto("/lobby", {replaceState: true});
    } else {
      showError = true;
    }
  }

  onMount(() => {
    deviceSupported = deviceIsSupported();
  });
</script>

<div class="h-full flex flex-col justify-between items-center">
  {#if deviceSupported}
    <Title></Title>
    <NameInput bind:playerName bind:showError></NameInput>
    <div>
      <MainButton on:click={() => createLobby()}>Create Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
