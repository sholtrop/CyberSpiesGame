<script lang="ts">
  import { onMount } from "svelte";
  import { getSocketIO } from "$lib/websocket";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import NameInput from "$lib/NameInput.svelte";
  import { deviceIsSupported, gotoReplace } from "$lib/util";
  import type { Socket } from "socket.io-client";
  import { lobbyStore, playerColorStore, playerStore } from "$lib/stores";
  import { dev } from "$app/environment";

  let socket: Socket;
  let joinCode: string;
  let deviceSupported: boolean;
  let playerName = "";
  let error = "";
  let creator = "";

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
    if (urlCode === null) gotoReplace("/");
    else joinCode = urlCode;
    creator = $page.url.searchParams.get("creator")!;

    socket = getSocketIO();
    socket.on("error", ({ error: err }) => (error = err));
    socket.on("error", console.error);

    socket.on("joinedLobby", ({ lobby, color }) => {
      console.debug({ lobby, color });
      playerColorStore.set(color);
      lobbyStore.set(lobby);
      sessionStorage.setItem(
        "gameInfo",
        JSON.stringify({
          playerId: $playerStore!.id,
          lobbyId: $lobbyStore!.id,
          color: $playerColorStore!,
        })
      );
      if (!dev) document.getElementById("main-panel")!.requestFullscreen();
      gotoReplace("/lobby");
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
    <div class="w-full flex flex-col items-center text-center">
      <NameInput bind:playerName />
      <p class:invisible={error === ""} class="text-red-500">{error}&nbsp;</p>
    </div>
    <div>Join {creator}'s lobby</div>
    <div class="mb-10">
      <MainButton on:click={() => joinLobby()}>Join Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
