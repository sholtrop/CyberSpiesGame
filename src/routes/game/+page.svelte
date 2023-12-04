<script lang="ts">
  import { goto } from "$app/navigation";
  import ScanButton from "$lib/ScanButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  import TaskBar from "$lib/TaskBar.svelte";
  import { COLORS } from "$lib/consts";
  import { lobbyStore, playerStore } from "$lib/stores";
  import type { Task } from "$lib/types";
  import { emitGameAction } from "$lib/websocket";
  import { onMount } from "svelte";
  import { press, swipe } from "svelte-gestures";

  let mainDiv: HTMLDivElement;
  let spyDiv: HTMLDivElement;
  let killCD: number;
  let sabotageCD: number;

  onMount(() => {
    if ($lobbyStore == null || $playerStore == null)
      goto(`/`, { replaceState: true });
  });

  function scrollDown() {
    mainDiv.scroll({ top: mainDiv.scrollHeight, behavior: "smooth" });
  }

  function scrollUp() {
    mainDiv.scroll({ top: 0, behavior: "smooth" });
  }

  function swipeHandler(event: any) {
    if (event.detail.direction === "top") scrollDown();
    if (event.detail.direction === "bottom") scrollUp();
  }

  function startKillCD() {
    let interval = setInterval(() => {
      killCD--;
      if (killCD <= 0) clearInterval(interval);
    }, 1000);
  }

  function setKillCD() {
    let cd = 5;
    killCD = cd;
    startKillCD();
  }

  function startSabotageCD() {
    let interval = setInterval(() => {
      sabotageCD--;
      if (sabotageCD <= 0) clearInterval(interval);
    }, 1000);
  }

  function setSabotageCD() {
    let cd = 7;
    sabotageCD = cd;
    startSabotageCD();
  }

  setKillCD();
  setSabotageCD();

  function pressHandler(task: number) {
    if ($playerStore?.role === "impostor") {
      emitGameAction({ action: "taskCompleted", taskNumber: task });
    }
  }
</script>

{#if $lobbyStore != null && $playerStore != null}
  <div
    bind:this={mainDiv}
    use:swipe={{ timeframe: 300, minSwipeDistance: 100 }}
    on:swipe={swipeHandler}
    class="mainDiv overflow-y-hidden"
    style="height: calc(100vh - 2.5rem)"
  >
    <div class="h-full w-screen flex flex-col justify-between items-center">
      <div class="w-full px-5">
        <div class="my-4">
          <TaskBar taskProgress={$lobbyStore.taskProgression.displayed} />
        </div>
        <p class="text-lg mt-8">Tasks:</p>
        <ul class="list-disc list-inside space-y-3 mt-2">
          {#each $playerStore.tasks as task}
            <li
              use:press={{ timeframe: 600, triggerBeforeFinished: true }}
              on:press={() => pressHandler(task.number)}
            >
              <span class:line-through={task.status === "completed"}
                >{task.description}}</span
              >
            </li>
          {/each}
        </ul>
      </div>
      <div class="self-center mb-10">
        <ScanButton
          on:scanned={(contents) => console.log("Scanned", contents)}
        />
      </div>
    </div>

    {#if $playerStore.role === "impostor"}
      <div
        bind:this={spyDiv}
        class="px-10 flex flex-col gap-10"
        style="height: calc(100vh - 2.5rem)"
      >
        <div class="h-24 mt-10">
          <p class="font-bold text-2xl">Status Report</p>
          <!-- I'm not making a component for a player list because I plan to style them all differently -->
          {#each Object.values($lobbyStore.players) as player}
            <div class="flex items-baseline space-x-1.5">
              <div class={COLORS[player.color] + " w-3 h-3"} />
              <div>{player.name} - {player.status}</div>
            </div>
          {/each}
        </div>
        <div class="flex flex-col">
          <p class="font-bold text-2xl mb-1">
            Sabotage <span class="text-base font-thin text-gray-400"
              >{sabotageCD ? "Ready in " + sabotageCD : "Ready"}</span
            >
          </p>
          <!-- TODO: grey out buttons when cd is up -->
          <SmallButton>Sabotage 1</SmallButton>
          <SmallButton>Sabotage 2</SmallButton>
        </div>
        <div class="flex flex-col">
          <p class="font-bold text-2xl mb-1">Power</p>
          <SmallButton>Power 1</SmallButton>
          <SmallButton>Power 2</SmallButton>
        </div>
        <div class="flex flex-col items-center">
          <p>Ready to kill{killCD ? " in " + killCD : ""}.</p>
          <div class="self-center mb-4 mt-2">
            <ScanButton
              on:scanned={(contents) => console.log("Scanned", contents)}
            />
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .mainDiv::-webkit-scrollbar {
    display: none;
  }
</style>
