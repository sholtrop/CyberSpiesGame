<script lang="ts">
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import QrCode from "$lib/QrCode.svelte";
  import { onMount } from "svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
  import InviteLink from "$lib/InviteLink.svelte";
  import type { Socket } from "socket.io-client";
  import { COLORS, MINIMUM_N_PLAYERS } from "$lib/consts";
  import { dev } from "$app/environment";

  let socket: Socket;
  let roomLink: string;

  onMount(() => {
    if ($lobbyStore == null) {
      // You can only access this page if you're in a lobby
      goto("/", { replaceState: true });
    }
    roomLink = getRoomLink();
    socket = getSocketIO();

    // The 'lobbyUpdate' event sends the entire state of the lobby to all players
    socket.on("lobbyUpdate", ({ lobby }) => {
      lobbyStore.set(lobby);
    });

    // The 'countDown' event sends only the current countDown (if there is any),
    // making it a more light-weight update
    socket.on("countDown", ({ count }) => {
      lobbyStore.update((lobby) => {
        if (lobby != null && "countDown" in lobby.status) {
          lobby.status.countDown = count;
          return lobby;
        }
        return null;
      });
    });

    // `subscribe` allows us to react to some change in the lobby state.
    // In this case, we want to navigate to /game when the game starts.
    // `subscribe` returns an unsubscribe function so that we can stop listening for events at some point.
    const unsubscribe = lobbyStore.subscribe((lobby) => {
      if (lobby?.status.state === "roleExplanation") goto("/role");
    });

    // When this component unmounts, the unsubscribe method
    // will be called by Svelte, freeing resources.
    // We only unsubscribe from the lobbyStore here, but NOT from the socketIO events.
    return unsubscribe;
  });

  function getRoomLink(): string {
    let link = window.location.origin + `/join?code=${$lobbyStore?.id}`;
    return link;
  }

  function startGame() {
    socket.emit("startGame");
  }

  // Game can only be started by the creator after enough playes are present
  $: enoughPlayers = $lobbyStore?.players.length === MINIMUM_N_PLAYERS;
  $: playerIsCreator = $lobbyStore?.creator === $playerStore?.name;
  $: canStartGame = (enoughPlayers && playerIsCreator) || dev;
</script>

{#if $lobbyStore != null}
  <div class="flex flex-col justify-between">
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
      <div class="flex justify-center -mt-4">
        <MainButton disabled={!canStartGame} on:click={() => startGame()}>
          {#if canStartGame}
            Start Game {#if dev}<span class="text-sm">(dev mode)</span>{/if}
          {:else if !playerIsCreator}<span class="text-base">
              Waiting for host to start game</span
            >
          {:else if !enoughPlayers}
            Game requires 5 players
          {/if}
        </MainButton>
      </div>
    </div>
  </div>
{/if}
