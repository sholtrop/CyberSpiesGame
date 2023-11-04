<script lang="ts">
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  let mainDiv: HTMLDivElement;
  let tasks: { name: string; room: string }[] = [];
  let spy: boolean = true; // TODO: store this info from role after receiving it on the role page.

  const players = [
    { name: "Lochyin", color: "green", status: "alive" },
    { name: "Salih", color: "blue", status: "alive" },
    { name: "Amber", color: "yellow", status: "hacked" },
    { name: "Steef", color: "white", status: "hacked" },
    { name: "Sjors", color: "red", status: "dead" },
  ];

  const colors = {
    red: "bg-red-600",
    orange: "bg-orange-600",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    blue: "bg-blue-600",
    purple: "bg-purple-700",
    white: "bg-white",
  } as { [key: string]: string };

  function goFullScreen() {
    mainDiv.requestFullscreen();
  }

  function scanNFC() {}

  function addTask(name: string, room: string) {
    tasks = [...tasks, { name, room }];
  }

  function addFakeTasks() {
    addTask("Strengthen firewall", "Room 302/304");
  }

  // TODO: scroll completely with one swipe with minimum distance

  if (dev) addFakeTasks();
</script>

<div bind:this={mainDiv} class="mainDiv min-h-full overflow-auto whitespace-nowrap">
  <div class="h-full w-screen flex flex-col justify-between items-center">
    <div>
      <p class="text-lg">Tasks:</p>
      <ul class="list-disc list-inside">
        {#each tasks as task}
          <li><span>{task.name}</span> <span>{task.room}</span></li>
        {/each}
      </ul>
    </div>
    <div class="self-center">
      <MainButton on:click={() => scanNFC()}>Scan</MainButton>
    </div>
  </div>

  {#if spy}
    <div class="h-full px-10 flex flex-col gap-10">
      <div>
        <p class="font-bold text-2xl">Status Report</p>
        {#each players as player}
          <div class="flex items-baseline space-x-1.5">
            <div class={colors[player.color] + " w-3 h-3"} />
            <div>{player.name} - {player.status}</div>
          </div>
        {/each}
      </div>
      <div class="flex flex-col">
        <p class="font-bold text-2xl">Sabotage</p>
        <SmallButton>Sabotage 1</SmallButton>
        <SmallButton>Sabotage 2</SmallButton>
        <SmallButton>Sabotage 3</SmallButton>
      </div>
      <div class="flex flex-col">
        <p class="font-bold text-2xl">Power</p>
        <SmallButton>Power 1</SmallButton>
        <SmallButton>Power 2</SmallButton>
        <SmallButton>Power 3</SmallButton>
      </div>
    </div>
  {/if}
</div>


<style>
  .mainDiv::-webkit-scrollbar {
    display: none;
  }
</style>