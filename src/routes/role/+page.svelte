<script lang="ts">
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore, playerStore } from "$lib/lobbyStore";
  import { onMount } from "svelte";

  onMount(() => {
    return lobbyStore.subscribe((lobby) => {
      if (lobby?.status.state === "started") goto("/game");
    });
  });
</script>

<div class="flex flex-col items-center justify-between h-full">
  <p>
    Your role is: <span
      >{$playerStore?.role === "crew" ? "Cyber Criminal" : "Secret Agent"}</span
    >
  </p>
  {#if $playerStore?.role === "impostor"}
    <p>Your tasks are fake. Swipe up to see your special powers.</p>
  {/if}

  {#if $lobbyStore?.status.state === "roleExplanation"}
    <MainButton disabled
      >Game will start in {$lobbyStore.status.countDown}</MainButton
    >
  {/if}
</div>
