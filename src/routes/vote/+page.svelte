<script lang='ts'>
  import { dev } from "$app/environment";
  import type { HTMLDialogAttributes } from 'svelte/elements'
  import MainButton from "$lib/MainButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  import TaskBar from "$lib/TaskBar.svelte";
  import { onMount, type ComponentProps, SvelteComponent } from "svelte";
  import { browser } from '$app/environment';

  let taskProgress: number = 50;

  const players = [
    { name: "Lochyin", color: "green", status: "alive" },
    { name: "Salih", color: "blue", status: "alive" },
    { name: "Amber", color: "yellow", status: "dead" },
    { name: "Steef", color: "white", status: "dead" },
    { name: "Sjors", color: "red", status: "-" },
  ];

  function updateTaskBar(value: number) {
    taskProgress = value;
  }
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
    <div class="flex flex-col gap-5">
      <p class="font-bold text-lg">Vote off the spy!</p>
      {#each players as player}
        {#if player.status == "alive"}
          <div class="border border-green-600 px-6 py-4 text-center text-md">
            {player.name}
          </div>
        {/if}        
      {/each}
    </div>
  </div>
  <div class="flex justify-between">
    <div>
      <MainButton>Vote</MainButton>
    </div>
    <div> 
      <MainButton>Skip</MainButton>
    </div>
  </div>
</div>