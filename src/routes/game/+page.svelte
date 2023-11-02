<script lang="ts">
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  let mainDiv: HTMLDivElement;
  let tasks: { name: string; room: string }[] = [];

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

  if (dev) addFakeTasks();
</script>

<div bind:this={mainDiv} class="min-h-full flex flex-col justify-between">
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
