<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  function isSpy() {
    let spy = true;
    return spy;
  }

  function gotoGame() {
    setTimeout(() => {
      if (browser) {
        goto("/game", { replaceState: true });
      }
    }, 5000);
  }

  gotoGame();
</script>

<div class="flex flex-col justify-center">
  <p>Your role is: <span>{isSpy() ? "Spy" : "Cyber Criminal"}</span></p>
  {#if isSpy()}
    <p>Your tasks are fake. Swipe up to see your special powers.</p>
  {/if}
</div>
