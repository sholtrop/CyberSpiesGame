<script lang="ts">
  import { COLORS } from "$lib/consts";
  import { lobbyStore } from "$lib/stores";
  import type { Lobby } from "$lib/types";
  import { onMount } from "svelte";

  let playerOverview: Lobby["players"];

  onMount(() => {
    if ($lobbyStore != null)
      playerOverview = JSON.parse(JSON.stringify($lobbyStore.players));
  });
</script>

{#if $lobbyStore != null && $lobbyStore.status.state === "gameEnded"}
  <div class="h-full flex flex-col justify-between items-center">
    <div>
      <p class="text-2xl mb-10 text-center capitalize">
        {$lobbyStore.status.victors} Victory
      </p>
      <p class="text-xl mb-10">
        {$lobbyStore.status.reason}
      </p>
      <div>
        {#each Object.values(playerOverview ?? {}) as player}
          <div class="flex items-baseline space-x-1.5">
            <div class={COLORS[player.color] + " w-3 h-3"} />
            <div>{player.name} ({player.role.name}) - {player.status}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Out of scope for now -->
    <!-- <div class="mb-10">
      <MainButton on:click={gotoLobby}>Play Again</MainButton>
    </div> -->
  </div>
{/if}
