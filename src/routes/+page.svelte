<script lang="ts">
  import { onMount } from "svelte";
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import NameInput from "$lib/NameInput.svelte";
  import { deviceIsSupported, gotoReplace } from "$lib/util";
  import type { Socket } from "socket.io-client";
  import { lobbyStore, playerColorStore, playerStore } from "$lib/stores";
  import { dev } from "$app/environment";

  let deviceSupported: boolean;

  let playerName = "";
  let error = "";
  let socket: Socket;

  function createLobby() {
    if (playerName) {
      socket.emit("createLobby", { name: playerName });
    } else {
      error = "Please enter a name";
    }
  }

  onMount(() => {
    deviceSupported = deviceIsSupported();
    if (!deviceIsSupported) return;
    socket = getSocketIO();
    // TODO: Display the error to the user somehow
    socket.on("error", ({ error: err }) => (error = err));
    socket.on("joinedLobby", ({ lobby, color }) => {
      console.debug({ lobby, color });
      playerColorStore.set(color);
      lobbyStore.set(lobby);
      localStorage.setItem(
        "gameInfo",
        JSON.stringify({
          playerId: $playerStore!.id,
          lobbyId: $lobbyStore!.id,
          color: $playerColorStore!,
        })
      );

      if (!dev) document.getElementById("main-panel")!.requestFullscreen();
      gotoReplace(`/setuprooms`);
    });

    // From `onMount` we can return a cleanup function that Svelte runs whenever a component unmounts (disappears).
    // At the very least, we need to unsub from socketIO events that only this page needs.
    return () => {
      socket.removeAllListeners("error");
      socket.removeAllListeners("joinedLobby");
    };
  });
</script>

<div class="flex flex-col items-center justify-between flex-1">
  {#if deviceSupported}
    <Title />

    <div
      class="pb-20 space-y-20 flex flex-col items-center justify-center w-screen"
    >
      <div class="w-full flex flex-col items-center">
        <NameInput bind:playerName />
        <p class:invisible={error === ""} class="text-red-500">{error}&nbsp;</p>
      </div>
      <MainButton on:click={() => createLobby()}>Create Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
