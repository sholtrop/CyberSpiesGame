<script lang="ts">
  import MainButton from "$lib/MainButton.svelte";
  import { browser } from "$app/environment";

  let buttonTimer: number = 10;

  function callMeeting() {
    if (!buttonTimer) {
      
    }
  }

  function setTimer() {
    let timer = 15;
    buttonTimer = timer;
  }

  function countDown() {
    let interval = setInterval(() => {
      if (browser) buttonTimer--;
      if (buttonTimer <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  setTimer();
  countDown();

</script>

<div class="h-full flex flex-col justify-center">
  <p>{buttonTimer ? "Remaining time: " + buttonTimer : "Ready!"}</p>
  <div>
    <MainButton on:click={callMeeting}>Call a rendezvous!</MainButton>
  </div>
</div>