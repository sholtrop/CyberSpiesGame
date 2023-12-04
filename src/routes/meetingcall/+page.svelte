<script lang="ts">
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import ScanButton from "$lib/ScanButton.svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
  import type { Color, Lobby } from "$lib/types";
  import { scanNfc } from "$lib/util";
  import { onMount } from "svelte";

  let meetingCall: string;

  onMount(() => {
    if ($lobbyStore != null && $lobbyStore.status.state === "meetingCalled") {
      if ($lobbyStore.status.type === "emergency")
        meetingCall = "Emergency meeting has been called!";
      else meetingCall = "A body has been found!";
    }

    return lobbyStore.subscribe((lobby) => {
      if (lobby == null) return;

      if (
        lobby.status.state == "meetingCalled" &&
        lobby.status.presentPlayers[$playerStore!.color]
      ) {
        goto("/awaitMeeting", { replaceState: true });
      } else if (lobby.status.state == "meeting")
        goto("/vote", { replaceState: true });
    });
  });

  function handleScan(contents: string) {
    console.log(
      contents,
      "TODO: check if scanned tag was the meeting tag. If so, report to backend"
    );
  }
</script>

<div class="flex-1 flex flex-col justify-between items-center">
  <div class="w-11/12">
    <h1 class="text-2xl text-center mb-10">{meetingCall}</h1>
    <div>Go to the meeting room now and scan the tag.</div>
  </div>
  <div class="self-center mb-10">
    <ScanButton on:scanned={({ detail }) => handleScan(detail)} />
  </div>
</div>
