<script lang="ts">
  import TaskBar from "$lib/TaskBar.svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
    import { lobbyStore } from "$lib/stores";
    import { COLORS } from "$lib/consts";
    import { emitGameAction } from "$lib/websocket";
    import { MEETING_TIME, PLAYER_COLORS } from "../../../server/consts";
    import type { Color, Vote } from "$lib/types";
    import { gotoReplace } from "$lib/util";

  let taskProgress = $lobbyStore?.taskProgression.displayed;
  let playerPick: Vote;
  let voted = false;
  let resultsShown = false;
  let voteTime = 5; // voting duration
  let timer = voteTime;
  let voteCount = 0;
  let maxVotes = ($lobbyStore && $lobbyStore.status.state === "meeting") ? $lobbyStore.status.nVoters : -1;
  let voters: Color[] = [];

  let tempCount = 0;
  $: if ($lobbyStore && $lobbyStore.status.state === "meeting") {
    Object.entries($lobbyStore.status.votes).forEach(([key, value]) => {
      if ($lobbyStore && $lobbyStore.status.state == "meeting" && $lobbyStore.status.votes[key as any] !== "noVote" && !voters.includes(key as any)) {
        voters.push(key as any);
        voteCount++;
      }
    });
  } 

  $: if ($lobbyStore && $lobbyStore.status.state === "meeting") console.log(typeof $lobbyStore?.status.votes);  

  $: if ($lobbyStore && $lobbyStore.status.state === "voteResultAnnounced") {
    gotoReplace("/voteover");
  }

  const players = [
    { name: "Lochyin", color: "green", status: "alive" },
    { name: "Salih", color: "blue", status: "alive" },
    { name: "Amber", color: "yellow", status: "dead" },
    { name: "Steef", color: "white", status: "dead" },
    { name: "Sjors", color: "red", status: "-" },
  ];

  let votes = {
    Lochyin: 1,
    Salih: 0,
    Skip: 1,
  } as { [key: string]: number };

  function updateTaskBar(value: number) {
    taskProgress = value;
  }

  function handlePlayerPick(event: any) {
    if (!voted && !resultsShown) playerPick = event.target.getAttribute("data-vote");
    console.log("playerPick: ", playerPick);
  }

  function voteHandler() {
    if (playerPick && !voted && !resultsShown) {
      // register vote to server
      voted = true;
      emitGameAction({action: "vote", vote: playerPick});
    }
  }

  function showResults() {
    resultsShown = true;
    // Remove selection if not confirmed before results are shown.
    if (playerPick && !voted) playerPick = "noVote";
  }

  function startTimer() {
    let interval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(interval);
        showResults();
        setTimeout(() => {
          if (browser) {
            goto("/voteover");
          }
        }, 5000);
      }
    }, 1000);
  }

  // startTimer();
</script>

{#if $lobbyStore !== null && $lobbyStore.status.state === "meeting"} 
  <div class="min-h-full flex flex-col justify-between">
    <div>
      <div class="mb-10">
        <TaskBar {taskProgress} />
      </div>
      <div class="flex gap-5 mb-5">
        <p>Died this round:</p>
        <div class="flex gap-5">
          {#if $lobbyStore}
            {#each Object.values($lobbyStore.players) as player}
              {#if player.status == "dead"}
                <div class="flex">
                  <div class={COLORS[player.color] + " w-3 h-3"}></div>
                  <p>{player.name}
                  {($lobbyStore.status.state == "meeting" && player.color === $lobbyStore.status.caller) 
                  ? " (Caller)" 
                  : ""}</p>
                </div>
              {/if}
            {/each}
          {/if}
        </div>
      </div>
      <div class="flex flex-col gap-5 {resultsShown ? 'items-start' : ''}">
        <p class="font-bold text-lg">
          {resultsShown ? "Voting results:" : "Vote off the spy!"}
        </p>
        <progress id="voteTimerBar" value={$lobbyStore.status.countDown} max={MEETING_TIME} class="w-full" />
        {#if $lobbyStore}
          {#each Object.values($lobbyStore.players) as player}
            {#if player.status == "alive"}
              <button
                on:click={handlePlayerPick}
                class="{resultsShown
                  ? ''
                  : 'border border-green-600'}  px-6 py-4 text-center text-md {player.color ==
                playerPick
                  ? 'bg-green-600'
                  : ''}"
                data-vote={player.color}
              >
                {player.name} {$lobbyStore.status.caller === player.color ? " (Caller)" : ""}
                {resultsShown ? ": " + votes[player.name] : (voters.includes(player.color) ? " (Voted)" : "" )}
              </button>
            {/if}
          {/each}
        {/if}
        <button
          on:click={handlePlayerPick}
          class="{resultsShown
            ? ''
            : 'border border-green-600'} px-6 py-4 text-center text-md {'skip' ==
          playerPick
            ? 'bg-green-600'
            : ''}"
          data-vote="skip">Skip{resultsShown ? ": " + votes.Skip : ""}</button
        >
      </div>
    </div>
    <div class="text-center">
      <button
        on:click={voteHandler}
        class="border px-6 py-4 mb-10 text-lg border-green-600 {voted ||
        resultsShown
          ? 'bg-gray-500'
          : ''}">Vote {voteCount}/{$lobbyStore.status.nVoters}</button
      >
    </div>
  </div>
{/if}
