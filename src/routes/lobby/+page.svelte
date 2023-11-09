<script lang="ts">
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import QrCode from "$lib/QrCode.svelte";
  import { onMount } from "svelte";
  import { lobbyStore, playerStore } from "$lib/lobbyStore";
  import InviteLink from "$lib/InviteLink.svelte";
  import type { Socket } from "socket.io-client";
  import { COLORS, MINIMUM_N_PLAYERS } from "$lib/consts";

  let socket: Socket;
  let roomLink: string;

  onMount(() => {
    if ($lobbyStore == null) {
      // You can only access this page if you're in a lobby
      goto("/", { replaceState: true });
    }
    roomLink = getRoomLink();
    socket = getSocketIO();

    socket.on("lobbyUpdate", ({ lobby }) => {
      lobbyStore.set(lobby);
    });
    socket.on("playerUpdate", ({ player }) => {
      playerStore.set(player);
    });

    // From `onMount` we can return a cleanup function that Svelte runs whenever a component unmounts (disappears).
    // At the very least, we need to unsub from socketIO events that only this page needs.
    return () => {
      socket.removeAllListeners("lobbyUpdate");
      socket.removeAllListeners("playerUpdate");
    };
  });

  function getRoomLink(): string {
    let link = window.location.origin + `/join?code=${$lobbyStore?.id}`;
    return link;
  }

  function startGame() {
    goto("/role", { replaceState: true });
  }

  // Game can only be started by the creator after enough playes are present
  $: enoughPlayers = $lobbyStore?.players.length === MINIMUM_N_PLAYERS;
  $: playerIsCreator = $lobbyStore?.creatorName === $playerStore?.name;
  $: canStartGame = enoughPlayers && playerIsCreator;
</script>

{#if $lobbyStore != null}
  {$playerStore?.name} and {$lobbyStore?.creatorName}
  <div class="min-h-full flex flex-col justify-between">
    <div class="flex flex-col items-center">
      <Title />
      <div class="my-10 flex flex-col items-center">
        <p class="text-center mb-3">
          Invite Link: <br />
          <InviteLink {roomLink} />
        </p>
        <QrCode link={roomLink} />
      </div>
      <div>
        <h2 class="font-bold text-lg">Players:</h2>
        <div class="grid grid-rows-4 grid-cols-3 gap-x-3 gap-y-1">
          {#each $lobbyStore.players as { name, color }}
            <div class="flex items-baseline space-x-1.5 w-24">
              <div class={COLORS[color] + " w-3 h-3"} />
              <div>{name}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="mb-10 flex justify-center">
      <MainButton disabled={!canStartGame} on:click={() => startGame()}>
        {#if canStartGame}
          Start Game
        {:else if !playerIsCreator}<span class="text-base">
            Waiting for host to start game</span
          >
        {:else if !enoughPlayers}
          Game requires 5 players
        {/if}
      </MainButton>
    </div>
  </div>
{/if}
