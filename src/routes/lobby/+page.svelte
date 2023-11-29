<script lang="ts">
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
  import AgentRoleExplanation from "$lib/AgentRoleExplanation.svelte";
  import { swipe } from "svelte-gestures";
  import { getSocketIO } from "$lib/websocket";

  const N_PAGES = 4;

  let socket: Socket;
  let roomLink: string;
  let infoPage = 0;

  onMount(() => {
    if ($lobbyStore == null) {
      // You can only access this page if you're in a lobby
      goto("/", { replaceState: true });
    }
    roomLink = getRoomLink();
    socket = getSocketIO();
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

  function swipeHandler(event: any) {
    if (event.detail.direction === "left")
      infoPage = Math.min(infoPage + 1, N_PAGES - 1);
    if (event.detail.direction === "right")
      infoPage = Math.max(infoPage - 1, 0);
  }

  function getRoomLink(): string {
    let link = window.location.origin + `/join?code=${$lobbyStore?.id}`;
    return link;
  }

  function startGame() {
    socket.emit("startGame");
  }

  function setReady() {
    socket.emit("gameAction", { action: "playerReady" });
  }

  // Game can only be started by the creator after enough playes are present
  $: enoughPlayers =
    Object.values($lobbyStore?.players || {}).length === MINIMUM_N_PLAYERS;

  $: playerIsCreator = $lobbyStore?.creator === $playerStore?.name;

  $: allPlayersReady =
    $lobbyStore?.status.state === "inLobby" &&
    Object.values($lobbyStore.status.readyPlayers).length === MINIMUM_N_PLAYERS;

  $: canStartGame =
    (enoughPlayers && playerIsCreator && allPlayersReady) || dev;
</script>

{#if $lobbyStore != null && $lobbyStore.status.state === "inLobby"}
  <div
    use:swipe={{ timeframe: 300, minSwipeDistance: 100 }}
    on:swipe={swipeHandler}
    class="min-h-screen"
  >
    <div class="flex flex-col items-center justify-between min-h-screen">
      <div class="flex flex-col items-center justify-center">
        {#if infoPage === 0}
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
                  {#each Object.values($lobbyStore.players) as { name, color }}
                    <div class="flex items-baseline space-x-1.5 w-24">
                      <div class={COLORS[color] + " w-3 h-3"} />
                      <div>{name}</div>
                      <div
                        class="text-white text-lg"
                        class:invisible={$lobbyStore.status.readyPlayers[
                          color
                        ] !== true}
                      >
                        ✓
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {:else if infoPage === 1}
          TODO: General game explanation
        {:else if infoPage === 2}
          TODO: Cyber criminal role explanation
        {:else if infoPage === 3}
          <AgentRoleExplanation />
        {/if}
      </div>
      <div class="mb-4 flex flex-col items-center">
        <span class="text-gray-300">Swipe to see tutorials</span>
        <div class="mb-4 flex space-x-2 justify-around w-20 mt-2">
          {#each Array(4) as _, idx}
            <div
              class="w-3 h-3 rounded-full"
              class:bg-gray-300={idx === infoPage}
              class:bg-gray-700={idx !== infoPage}
            ></div>
          {/each}
        </div>
        {#if canStartGame}
          <MainButton on:click={startGame}>Start game</MainButton>
        {:else if !enoughPlayers}
          <MainButton disabled>Waiting for players to join...</MainButton>
        {:else if !allPlayersReady}
          <MainButton disabled>Not all players are ready</MainButton>
        {:else if !playerIsCreator}
          <MainButton disabled>Waiting for creator to start game</MainButton>
        {:else}
          <MainButton on:click={setReady}>Tap when ready</MainButton>
        {/if}
      </div>
    </div>
  </div>
{/if}
