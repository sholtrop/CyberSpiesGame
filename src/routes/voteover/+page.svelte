<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { gotoReplace } from "$lib/util";

  let voteResult: string;

  function setVoteResult() {
    voteResult = "";
  }

  function gotoGame() {
    setTimeout(() => {
      if (browser) {
        gotoReplace("/game");
      }
    }, 5000);
  }

  setVoteResult();
  gotoGame();
</script>

<div>
  <p>{voteResult ? voteResult : "No one"} got executed.</p>
</div>
