<script lang="ts">
  import { onMount } from "svelte";
  import { getSocketIO } from "$lib/websocket";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import NameInput from "$lib/NameInput.svelte";
  import { deviceIsSupported } from "$lib/util";
  import type { Socket } from "socket.io-client";
  import { lobbyStore, playerColorStore } from "$lib/stores";

  let socket: Socket;
  let joinCode: string;
  let deviceSupported: boolean;
  let playerName = "";
  let error = "";

  function joinLobby() {
    if (playerName) {
      socket.emit("joinLobby", { name: playerName, lobbyId: joinCode });
    } else {
      error = "Please enter a name";
    }
  }

  onMount(() => {
    deviceSupported = deviceIsSupported();
    const urlCode = $page.url.searchParams.get("code");
    if (urlCode === null) goto("/", { replaceState: true });
    else joinCode = urlCode;
    socket = getSocketIO();
    socket.on("error", ({ error: err }) => (error = err));
    socket.on("error", console.error);

    socket.on("joinedLobby", ({ lobby, color }) => {
      console.debug({ lobby, color });
      playerColorStore.set(color);
      lobbyStore.set(lobby);
      document.getElementById("main-panel")!.requestFullscreen();
      goto("/lobby", { replaceState: true });
    });

    // From `onMount` we can return a cleanup function that Svelte runs whenever a component unmounts (disappears).
    // At the very least, we need to unsub from socketIO events that only this page needs.
    return () => {
      socket.removeAllListeners("error");
      socket.removeAllListeners("joinedLobby");
    };
  });
</script>

<div class="min-h-screen flex flex-col justify-between items-center">
  {#if deviceSupported}
    <Title />
    <div class="w-full flex flex-col items-center">
      <NameInput bind:playerName />
      <p class:invisible={error === ""} class="text-red-500">{error}&nbsp;</p>
    </div>
    <div class="mb-10">
      <MainButton on:click={() => joinLobby()}>Join Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
