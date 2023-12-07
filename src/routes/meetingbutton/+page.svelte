<script lang="ts">
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore } from "$lib/stores";
  import { emitGameAction } from "$lib/websocket";

  function callMeeting() {
    emitGameAction({ action: "callMeeting" });
  }
</script>

{#if $lobbyStore != null && $lobbyStore.status.state === "started"}
  <div class="h-full flex flex-col justify-center flex-1">
    <p>
      {$lobbyStore.status.countDown > 0
        ? "Remaining time: " + $lobbyStore.status.countDown
        : "Ready!"}
    </p>
    <div>
      <MainButton
        disabled={$lobbyStore.status.countDown > 0 && !dev}
        on:click={callMeeting}
        >Call a Rendezvous!
        {#if dev}
          <div class="text-xs text-gray-400">(Dev mode: Can always click)</div>
        {/if}
      </MainButton>
    </div>
  </div>
{/if}
