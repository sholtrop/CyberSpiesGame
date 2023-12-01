<script lang="ts">
  import MainButton from "$lib/MainButton.svelte";
  let buttonTimer: number;

  function callMeeting() {
    if (!buttonTimer) {
    }
  }

  function setTimer() {
    let timer = 15;
    buttonTimer = timer;
    countDown();
  }

  function countDown() {
    let interval = setInterval(() => {
      buttonTimer--;
      if (buttonTimer <= 0) clearInterval(interval);
    }, 1000);
  }

  setTimer();
</script>

<div class="h-full flex flex-col justify-center">
  <p>{buttonTimer ? "Remaining time: " + buttonTimer : "Ready!"}</p>
  <div>
    <MainButton on:click={callMeeting}>Call a rendezvous!</MainButton>
  </div>
</div>
