<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import AgentRoleExplanation from "$lib/AgentRoleExplanation.svelte";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
  import { onMount } from "svelte";

  onMount(() => {
    return lobbyStore.subscribe((lobby) => {
      if (lobby?.status.state === "started") goto("/game");
    });
  });
</script>

<div class="flex flex-col items-center h-full space-y-10 mt-4">
  {#if $lobbyStore?.status.state === "roleExplanation"}
    <MainButton disabled={!dev} on:click={() => goto("/game")}
      >Game will start in {$lobbyStore.status.countDown}<br />
      <span class="text-sm text-gray-300">(Dev mode: Click to start now)</span>
    </MainButton>
  {/if}
  <p>
    Your role is: <span class="font-bold text-lg"
      >{$playerStore?.role === "crew" ? "Cyber Criminal" : "Secret Agent"}</span
    >
  </p>
  <!-- {#if $playerStore?.role === "impostor"} -->

  <AgentRoleExplanation />
  <!-- {/if} -->
</div>
