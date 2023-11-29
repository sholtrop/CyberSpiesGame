<script lang="ts">
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  import TaskBar from "$lib/TaskBar.svelte";
  import { press, swipe } from "svelte-gestures";
  import { lobbyStore, playerStore } from "$lib/lobbyStore";
  import { onMount } from "svelte";
  import type { Socket } from "socket.io-client";
  import { goto } from "$app/navigation";
  import { getSocketIO } from "$lib/websocket";


  let mainDiv: HTMLDivElement;
  let spyDiv: HTMLDivElement;
  let tasks: { name: string; room: string }[] = [];
  let spy = true; // TODO: store this info from role after receiving it on the role page.
  let taskProgress: number;
  let killCD: number;
  let sabotageCD: number;
  let socket: Socket;

  // just died and dead to show whether the player was killed after the previous meeting or before.
  const players = [
    { name: "Lochyin", color: "green", status: "alive" },
    { name: "Salih", color: "blue", status: "alive" },
    { name: "Amber", color: "yellow", status: "just died" },
    { name: "Steef", color: "white", status: "just died" },
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


  onMount(() => {
    if ($lobbyStore == null) {
      // You can only access this page if you're in a lobby
      goto("/", { replaceState: true });
    }
    socket = getSocketIO();
    console.log("mounting");
    socket.on("emergencyCalled", ({playerColor}) => {
      console.log("emergency call received");
      goto("/meetingcall", { replaceState: true });
    });
  });

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

  function scrollDown() {
    mainDiv.scroll({ top: mainDiv.scrollHeight, behavior: "smooth" });
  }

  function scrollUp() {
    mainDiv.scroll({ top: 0, behavior: "smooth" });
  }

  function swipeHandler(event: any) {
    if (event.detail.direction == "top") scrollDown();
    if (event.detail.direction == "bottom") scrollUp();
  }

  function updatePlayerStatus(player: number, status: string) {
    players[player]["status"] = status;
  }

  if (dev) addFakeTasks();

  function updateTaskBar(value: number) {
    taskProgress = value;
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

  function pressHandler(event: any) {
    if (spy) {
      console.log(event.target);
    }
  }

</script>

<div
  bind:this={mainDiv}
  use:swipe={{ timeframe: 300, minSwipeDistance: 100 }}
  on:swipe={swipeHandler}
  class="mainDiv min-h-full overflow-hidden whitespace-nowrap"
>
  <div class="h-full w-screen flex flex-col justify-between items-center">
    <div>
      <div class="mb-10">
        <TaskBar {taskProgress} />
      </div>
      <div>
        <p class="text-lg">Tasks:</p>
        <ul class="list-disc list-inside">
          {#each tasks as task}
            <li 
              use:press={{ timeframe: 600, triggerBeforeFinished: true }}
              on:press={pressHandler}
            ><span>{task.name}</span> <span>({task.room})</span></li>
          {/each}
        </ul>
      </div>
    </div>
    <div class="self-center mb-10">
      <MainButton on:click={() => scanNFC()}>Scan</MainButton>
    </div>
  </div>

  {#if spy}
    <div bind:this={spyDiv} class="h-full px-10 flex flex-col gap-10">
      <div>
        <p class="font-bold text-2xl">Status Report</p>
        <!-- I'm not making a component for a player list because I plan to style them all differently -->
        {#each players as player}
          <div class="flex items-baseline space-x-1.5">
            <div class={colors[player.color] + " w-3 h-3"} />
            <div>{player.name} - {player.status}</div>
          </div>
        {/each}
      </div>
      <div class="flex flex-col">
        <p class="font-bold text-2xl">
          Sabotage ({sabotageCD ? "CD: " + sabotageCD : "Ready"})
        </p>
        <!-- TODO: grey out buttons when cd is up -->
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
      <div>
        <p>Ready to kill{killCD ? " in " + killCD : ""}.</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .mainDiv::-webkit-scrollbar {
    display: none;
  }
</style>
