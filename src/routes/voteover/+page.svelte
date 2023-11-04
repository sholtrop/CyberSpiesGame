<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from '$app/environment';

  let voteResult: string;

  function setVoteResult() {
    voteResult = "";
  }

  function gotoGame() {
    setTimeout(() => {
      if (browser) {
          goto("/game", {replaceState: true});
      }
    }, 5000);
  }

  setVoteResult();
  gotoGame();

</script>

<div>
  <p>{voteResult ? voteResult : "No one"} got executed.</p>
</div>