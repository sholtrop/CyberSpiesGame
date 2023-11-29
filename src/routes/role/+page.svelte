<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
  import { onMount } from "svelte";

  onMount(() => {
    return lobbyStore.subscribe((lobby) => {
      if (lobby?.status.state === "started") goto("/game");
    });
  });
</script>

<div
  class="flex flex-col items-center justify-between min-h-screen space-y-10 py-10"
>
  <div class="flex flex-col items-center justify-end h-full mb-4">
    <p class="mb-2 text-lg">
      Your role is: <span class="font-bold"
        >{$playerStore?.role === "crew"
          ? "Cyber Criminal"
          : "Secret Agent"}</span
      >
    </p>

    {#if $playerStore?.role === "impostor"}
      TODO explanation
    {/if}
  </div>
  {#if $lobbyStore?.status.state === "roleExplanation"}
    <MainButton disabled={!dev} on:click={() => goto("/game")}
      >Game will start in {$lobbyStore.status.countDown}<br />
      <span class="text-sm text-gray-300">(Dev mode: Click to start now)</span>
    </MainButton>
  {/if}
</div>
