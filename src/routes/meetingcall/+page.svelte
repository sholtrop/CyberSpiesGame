<script lang="ts">
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore } from "$lib/lobbyStore";
  import { goto } from "$app/navigation";

  let meetingCall: string;

  $: if ($lobbyStore?.status.state === "meeting") {
    goto("/vote", {replaceState: true});
  }

  function scanNFC() {}

  function bodyFound(): boolean {
    let body = ($lobbyStore != null && $lobbyStore.status.state === "meetingCalled" && $lobbyStore.status.type === "bodyFound");
    return body;
  }

  function setMeetingReason() {
    meetingCall = bodyFound() ? "A body has been found!" : "Rendezvous called!";
  }

  setMeetingReason();
</script>

<div class="h-full flex flex-col justify-between">
  <div>
    <p class="text-2xl">{meetingCall}</p>
    <p>Go to the meeting room now.</p>
  </div>
  <div class="self-center mb-10">
    <MainButton on:click={() => scanNFC()}>Scan</MainButton>
  </div>
</div>
