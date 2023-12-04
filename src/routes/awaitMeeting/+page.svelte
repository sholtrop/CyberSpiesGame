<script lang="ts">
  import { goto } from "$app/navigation";
  import { lobbyStore, notificationStore, playerStore } from "$lib/stores";
  import { onMount } from "svelte";

  onMount(() => {
    if ($lobbyStore?.status.state == "meeting")
      goto("/vote", { replaceState: true });

    return lobbyStore.subscribe((lobby) => {
      if (lobby != null && lobby.status.state == "meeting") {
        if ($playerStore?.status === "alive")
          goto("/vote", { replaceState: true });
        else goto("/dead", { replaceState: true });
      }
    });
  });
</script>

<div>
  <p>Waiting for everyone to join the meeting...</p>
</div>
