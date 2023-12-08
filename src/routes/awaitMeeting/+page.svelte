<script lang="ts">
  import { goto } from "$app/navigation";
  import { lobbyStore, notificationStore, playerStore } from "$lib/stores";
  import { gotoReplace } from "$lib/util";
  import { onMount } from "svelte";

  onMount(() => {
    if ($lobbyStore?.status.state == "meeting") gotoReplace("/vote");

    return lobbyStore.subscribe((lobby) => {
      if (lobby != null && lobby.status.state == "meeting") {
        if ($playerStore?.status === "alive") gotoReplace("/vote");
        else gotoReplace("/dead");
      }
    });
  });
</script>

<div>
  <p>Waiting for everyone to join the meeting...</p>
</div>
