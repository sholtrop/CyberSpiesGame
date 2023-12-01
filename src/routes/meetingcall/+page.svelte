<script lang="ts">
    import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
    import { lobbyStore, playerStore } from "$lib/stores";
    import type { Color, Lobby } from "$lib/types";
  import { scanNfc } from "$lib/util";
    import { onMount } from "svelte";

  let meetingCall: string;

  onMount(() => {
    let playerColor: Color;
    let unsubscribePlayer = playerStore.subscribe((player) => {
      if (player != null) playerColor = player.color;
    });

    let unsubscribeLobby = lobbyStore.subscribe((lobby) => {
      if (lobby != null && lobby.status.state == "meetingCalled" && lobby.status.presentPlayers[playerColor]) {
        goto("/awaitMeeting", { replaceState: true });
      }
    });

    function unsubscribe () {
      unsubscribeLobby();
      unsubscribePlayer();
    }

    return unsubscribe;
  });

  function bodyFound(): boolean {
    let body = true;
    return body;
  }

  function setMeetingReason() {
    meetingCall = bodyFound() ? "A body has been found!" : "Rendezvous called!";
  }

  setMeetingReason();
</script>

<div class="h-screen flex flex-col justify-between">
  <div>
    <p class="text-2xl">{meetingCall}</p>
    <p>Go to the meeting room now.</p>
  </div>
  <div class="self-center mb-10">
    <MainButton on:click={() => scanNfc()}>Scan</MainButton>
  </div>
</div>
