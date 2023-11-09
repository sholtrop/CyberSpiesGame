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
  import { lobbyStore, playerStore } from "$lib/lobbyStore";

  let socket: Socket;
  let joinCode: string;
  let deviceSupported: boolean;
  let playerName = "";
  let showError = false;

  function joinLobby() {
    if (playerName) {
      socket.emit("joinLobby", { name: playerName, lobbyId: joinCode });
      goto("/lobby", { replaceState: true });
    } else {
      showError = true;
    }
  }

  onMount(() => {
    deviceSupported = deviceIsSupported();
    const urlCode = $page.url.searchParams.get("code");
    if (urlCode === null) goto("/", { replaceState: true });
    else joinCode = urlCode;
    socket = getSocketIO();
    socket.on("error", console.error);
    socket.on("joinedLobby", ({ lobby, player }) => {
      console.debug({ lobby });
      playerStore.set(player);
      lobbyStore.set(lobby);
      goto(`/lobby?id=${lobby.id}`, { replaceState: true });
    });

    // From `onMount` we can return a cleanup function that Svelte runs whenever a component unmounts (disappears).
    // At the very least, we need to unsub from socketIO events that only this page needs.
    return () => {
      socket.removeAllListeners("error");
      socket.removeAllListeners("joinedLobby");
    };
  });
</script>

<div class="h-full flex flex-col justify-between items-center">
  {#if deviceSupported}
    <Title />
    <NameInput bind:playerName bind:showError />
    <div class="mb-10">
      <MainButton on:click={() => joinLobby()}>Join Lobby</MainButton>
    </div>
  {:else}
    Your device is not supported.<br />Try Google Chrome on Android.
  {/if}
</div>
