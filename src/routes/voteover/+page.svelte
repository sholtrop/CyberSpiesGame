<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { gotoReplace } from "$lib/util";
  import { lobbyStore } from "$lib/stores";
    import { COLORS } from "$lib/consts";

  let results: {[key: string]: number} = {};
  if ($lobbyStore && $lobbyStore.status.state === "voteResultAnnounced") {
    Object.entries($lobbyStore.status.votes).forEach(([key, value]) => {
      if ($lobbyStore && $lobbyStore.status.state == "voteResultAnnounced" && $lobbyStore.status.votes[key as any] !== "noVote") {
        if (results[value as any] > 0) {
          results[value as any]++;
        } else {
          results[value as any] = 1;
        }
      }
    });
  }

  function gotoGame() {
    setTimeout(() => {
      if (browser) {
        gotoReplace("/game");
      }
    }, 5000);
  }

  // gotoGame();
</script>

<div class="h-full flex flex-col justify-between p-5">
  {#if $lobbyStore && $lobbyStore.status.state === "voteResultAnnounced"}
    <div>
      <p>{($lobbyStore.status.votedOutPlayer) ? $lobbyStore.status.votedOutPlayer : "No one"} got executed.</p>
    </div>
    <div>
      {#each Object.entries(results) as [color, nVotes]}
      <div class="flex items-baseline space-x-1.5">
        <div class={COLORS[color] + " w-3 h-3"} />
        <div>
          {color}: {nVotes} votes
        </div>
      </div>
      {/each}
    </div>
    <div>
      <p>Going back in {$lobbyStore.status.countDown}s</p>
    </div>
  {/if}
</div>
