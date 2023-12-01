<script lang="ts">
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import { COLORS } from "$lib/consts";
  import { lobbyStore } from "$lib/stores";
    import type { Lobby } from "$lib/types";
    import { getSocketIO } from "$lib/websocket";
    import type { Socket } from "socket.io-client";
  import { onMount } from "svelte";

  let io = getSocketIO();
  let playerOverview: Lobby["players"];

  onMount(() => {
    io.on("lobbyReset", gotoLobby);
    if ($lobbyStore != null) playerOverview = $lobbyStore.players;
  });



  function gotoLobby() {
    goto("/lobby", { replaceState: true });
  }

  onMount(() => {

  });
</script>

{#if $lobbyStore != null && $lobbyStore.status.state === "gameEnded"}
  <div class="h-full flex flex-col justify-between items-center">
    <div>
      <p class="text-2xl mb-10 text-center capitalize">
        {$lobbyStore.status.victors} Victory
      </p>
      <div>
        {#each Object.values(playerOverview) as player}
          <div class="flex items-baseline space-x-1.5">
            <div class={COLORS[player.color] + " w-3 h-3"} />
            <div>{player.name} ({player.role}) - {player.status}</div>
          </div>
        {/each}
      </div>
    </div>
    <div class="mb-10">
      <MainButton on:click={gotoLobby}>Play Again</MainButton>
    </div>
  </div>
{/if}
