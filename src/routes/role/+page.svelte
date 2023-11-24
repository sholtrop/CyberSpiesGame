<script lang="ts">
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore, playerStore } from "$lib/lobbyStore";
  import { onMount } from "svelte";

  let ready = false;

  onMount(() => {
    return lobbyStore.subscribe((lobby) => {
      if (lobby?.status.state === "started") goto("/game");
    });
  });

  function toggleReady() {
    ready = true;
  }


</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={toggleReady} class="flex flex-col items-center justify-between h-full">
  {#if ready}
    <p>
      Your role is: <span
        >{$playerStore?.role === "crew" ? "Cyber Criminal" : "Secret Agent"}</span
      >
    </p>
    {#if $playerStore?.role === "impostor"}
      <p>Your tasks are fake. Swipe up to see your special powers.</p>
    {/if}
  {:else}
    <p>Tap to show your role</p>
  {/if}

  {#if $lobbyStore?.status.state === "roleExplanation"}
    <MainButton disabled
      >Game will start in {$lobbyStore.status.countDown}</MainButton
    >
  {/if}
</div>
