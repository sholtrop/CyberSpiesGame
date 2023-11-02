<script lang="ts">
  import MainButton from "$lib/MainButton.svelte";

  let meetingCall: string;

  function scanNFC() {

  }

  function bodyFound(): boolean {
    let body: boolean = true;
    return body;
  }

  function setMeetingReason() {
    meetingCall = bodyFound() ? "A body has beend found!" : "Rendezvous called!";
  }

  setMeetingReason();

</script>

<div class="h-full flex flex-col justify-between">
  <div>
    <p class="text-2xl">{meetingCall}</p>
    <p>Go to the meeting room now.</p>
  </div>
  <div class="self-center">
    <MainButton on:click={() => scanNFC()}>Scan</MainButton>
  </div>
</div>