<script lang='ts'>
  import { dev } from "$app/environment";
  import type { HTMLDialogAttributes } from 'svelte/elements'
  import MainButton from "$lib/MainButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  import TaskBar from "$lib/TaskBar.svelte";
  import { onMount, type ComponentProps, SvelteComponent } from "svelte";
  import { browser } from '$app/environment';
  import { goto } from "$app/navigation";

  let taskProgress: number = 50;
  let playerPick: string;
  let voted: boolean = false;
  let resultsShown = false;
  let voteTime: number = 5; // voting duration
  let timer:number = voteTime;

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
    Skip: 1
  } as { [key: string]: number };

  function updateTaskBar(value: number) {
    taskProgress = value;
  }

  function handlePlayerPick(event: any) {
    if (!voted && !resultsShown) playerPick = event.target.textContent;
  }

  function voteHandler() {
    if (playerPick && !voted && !resultsShown) {
      // register vote to server
      voted = true;
    }
  }

  function showResults() {
    resultsShown = true;
    // Remove selection if not confirmed before results are shown.
    if (playerPick && !voted) playerPick = "";
  }

  function startTimer() {
    let interval = setInterval(() => {
      timer--;
      if (timer <= 0) {
        clearInterval(interval);
        showResults();
        setTimeout(() => {
          if (browser) {
            goto("/voteover")
          }
        }, 5000);
      }
    }, 1000);
  }

  startTimer();
</script>

<div class="min-h-full flex flex-col justify-between">
  <div>
    <div class="mb-10">
      <TaskBar {taskProgress}></TaskBar>
    </div>
    <div class="flex gap-5 mb-5">
      <p>Dead:</p>
      <div class="flex gap-5">
        {#each players as player}
          {#if player.status == "dead"}
            <p>{player.name}</p>
          {/if}
        {/each}
      </div>
    </div>
    <div class="flex flex-col gap-5 {resultsShown ? "items-start" : ""}">
      <p class="font-bold text-lg">{resultsShown ? "Voting results:" : "Vote off the spy!"}</p>
      <progress id="voteTimerBar" value={timer} max={voteTime} class="w-full"></progress>
      {#each players as player}
        {#if player.status == "alive"}
          <div on:click={handlePlayerPick} class="{resultsShown ? "" : "border border-green-600"}  px-6 py-4 text-center text-md {player.name == playerPick ? "bg-green-600" : ""}">
            {player.name}{resultsShown ? ": " + votes[player.name] : ""}
          </div>
        {/if}        
      {/each}
      <div on:click={handlePlayerPick} class="{resultsShown ? "" : "border border-green-600"} px-6 py-4 text-center text-md  {"Skip" == playerPick ? "bg-green-600" : ""}">Skip{resultsShown ? ": " + votes.Skip : ""}</div>
    </div>
  </div>
  <div class="text-center">
    <button on:click={voteHandler} class="border px-6 py-4 mb-10 text-lg border-green-600 { (voted || resultsShown) ? "bg-gray-500" : ""}">Vote</button>
  </div>
</div>