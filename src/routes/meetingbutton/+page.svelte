<script lang="ts">
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
    import { gotoReplace } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";

  function callMeeting() {
    emitGameAction({ action: "callMeeting" });
  }

  function gobackHandler() {
    gotoReplace("/game");
  }
</script>

{#if $lobbyStore != null && $lobbyStore.status.state === "started"}
  <div class="h-full flex flex-col justify-between flex-1 p-10 items-center">
    <div></div>
    <div>
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
      <p>you have {$playerStore?.emergencyMeetingsLeft} meeting(s) left.</p>
    </div>
    <div>
      <button on:click={gobackHandler}>Go Back</button>
    </div>
  </div>
{/if}
