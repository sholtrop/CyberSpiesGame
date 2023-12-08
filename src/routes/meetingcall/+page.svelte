<script lang="ts">
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import ScanButton from "$lib/ScanButton.svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
  import type { Color, Lobby } from "$lib/types";
  import { gotoReplace, scanNfc } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";
  import { onMount } from "svelte";

  let meetingCall: string;

  onMount(() => {
    if ($lobbyStore != null && $lobbyStore.status.state === "meetingCalled") {
      if ($lobbyStore.status.type === "emergency")
        meetingCall = "Emergency meeting has been called!";
      else meetingCall = "A body has been found!";
    }

    const unsubLobby = lobbyStore.subscribe((lobby) => {
      if (lobby == null) return;

      if (
        lobby.status.state === "meetingCalled" &&
        lobby.status.presentPlayers[$playerStore!.color]
      ) {
        gotoReplace("/awaitMeeting");
      } else if (lobby.status.state == "meeting") gotoReplace("/vote");
    });

    return unsubLobby;
  });

  function handleScan(contents: string) {
    const [type, _] = contents.split(":");

    if (type === "meeting") {
      emitGameAction({ action: "enterMeeting" });
    }
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
