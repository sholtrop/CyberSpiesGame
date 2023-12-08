<script lang="ts">
  import ScanButton from "$lib/ScanButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  import TaskBar from "$lib/TaskBar.svelte";
  import { COLORS } from "$lib/consts";
  import {
    lobbyStore,
    notificationStore,
    playerColorStore,
    playerStore,
    showNotificationBar,
  } from "$lib/stores";
  import { gotoReplace } from "$lib/util";
  import { emitGameAction, getSocketIO } from "$lib/websocket";
  import { onMount } from "svelte";
  import { press, swipe } from "svelte-gestures";
  import {
    FIREWALL_COOLDOWN,
    FIREWALL_FIX_TIME,
    HACKED_SECS,
    HACK_COOLDOWN,
    TASKS,
    VIRUS_SCAN_COOLDOWN,
  } from "../../../server/consts";
  import { Socket, io } from "socket.io-client";
  import type { Color } from "$lib/types";

  let mainDiv: HTMLDivElement;
  let impostorDiv: HTMLDivElement;
  let impostorScreen = false;

  onMount(() => {
    const io = getSocketIO();
    if ($lobbyStore == null || $playerStore == null) gotoReplace(`/`);
    io.on("virusScan", () => {
      if (
        $playerStore?.role.name === "crew" &&
        $playerStore?.status === "alive" &&
        $playerStore.currentlyDoing.activity === "nothing"
      ) {
        gotoReplace("/dontmove");
      }
    });
  });

  function scrollDown() {
    $showNotificationBar = false;
    impostorScreen = true;
    mainDiv.scroll({ top: mainDiv.scrollHeight, behavior: "smooth" });
  }

  function scrollUp() {
    $showNotificationBar = true;
    impostorScreen = false;
    mainDiv.scroll({ top: 0, behavior: "smooth" });
  }

  function swipeHandler(event: any) {
    if ($playerStore?.role.name !== "impostor") return;
    if (event.detail.direction === "top") scrollDown();
    if (event.detail.direction === "bottom") scrollUp();
  }

  function pressHandler(task: number) {
    if ($playerStore?.role.name === "impostor") {
      emitGameAction({ action: "taskCompleted", taskNumber: task });
    }
  }

  function handleScanned(contents: string) {
    $notificationStore = "Scanned contents";
    console.log("Scanned", contents);
    const [type, info] = contents.split(":");
    if (type === "meeting") gotoReplace("/meetingbutton");
    else if (type === "task") {
      emitGameAction({ action: "startTask", taskNumber: Number(info) });
    } else if (type === "player") {
      const color = info as Color;
      if ($lobbyStore?.players[color].status === "dead")
        emitGameAction({ action: "reportDeadBody", bodyColor: color });
      else if (
        $lobbyStore?.players[color].status === "alive" &&
        $playerStore?.role.name === "impostor" &&
        $playerStore.role.killCooldown === 0
      )
        emitGameAction({ action: "killPlayer", targetColor: color });
    } else if (type === "firewall") {
      const number = Number(info);
      if ($playerStore?.currentlyDoing.activity === "fixFirewall")
        emitGameAction({ action: "finishFirewallFix", number });
      else if (
        $playerStore?.currentlyDoing.activity === "nothing" &&
        $lobbyStore?.activeEffects.firewallBreach != null
      )
        emitGameAction({ action: "startFirewallFix", number });
    } else if (type === "wiretap") {
      console.error("Not implemented");
    }
  }
</script>

{#if $lobbyStore != null && $playerStore != null}
  <div
    bind:this={mainDiv}
    use:swipe={{ timeframe: 300, minSwipeDistance: 100 }}
    on:swipe={swipeHandler}
    class="mainDiv overflow-y-hidden"
    style="height: calc(100vh - {impostorScreen ? 0 : 3.5}rem)"
  >
    <div
      class="w-screen flex flex-col justify-between items-center"
      style="height: calc(100vh - 3.5rem)"
    >
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
                >{task.description}</span
              >
            </li>
          {/each}
        </ul>
      </div>
      <div class="self-center mb-10">
        <ScanButton on:scanned={({ detail }) => handleScanned(detail)} />
      </div>
    </div>

    {#if $playerStore.role.name === "impostor"}
      <div
        bind:this={impostorDiv}
        class="px-10 flex flex-col justify-between h-screen"
      >
        <div class="h-24 mt-2 text-sm">
          <p class="font-bold text-2xl">Realtime Status</p>
          <!-- Alive players -->
          {#each Object.values($lobbyStore.players) as { color, name, status, currentlyDoing }}
            {#if color !== $playerColorStore && status === "alive"}
              <div class="flex items-baseline space-x-1.5">
                <div class={COLORS[color] + " w-3 h-3"} />
                <div>
                  {name} - Activity:
                  <span class="capitalize">{currentlyDoing.activity}</span>
                  {currentlyDoing.activity === "task"
                    ? `in ${
                        $lobbyStore.activities[
                          TASKS[currentlyDoing.number].name
                        ].room
                      }`
                    : ""}
                </div>
              </div>
            {/if}
          {/each}
          <!-- Dead players -->
          <div class="w-full border-b border-gray-600 my-2" />
          {#each Object.values($lobbyStore.players) as { color, name, status }}
            {#if color !== $playerColorStore && status !== "alive"}
              <div class="flex items-baseline space-x-1.5 text-gray-400">
                <div class={COLORS[color] + " w-3 h-3"} />
                <div>
                  {name} - {status}
                </div>
              </div>
            {/if}
          {/each}
        </div>
        <div class="flex flex-col">
          <p class="font-bold text-2xl mb-1">
            Sabotage <span class="text-base font-thin text-gray-300"
              >{$playerStore.role?.sabotageCooldown
                ? "Ready in " + $playerStore?.role.sabotageCooldown
                : "Ready"}</span
            >
          </p>
          <div class="flex flex-col space-y-6 mt-2">
            <div class="flex flex-col">
              <div class="flex space-x-2 items-center">
                <SmallButton
                  on:click={() =>
                    emitGameAction({
                      action: "launchSabotage",
                      sabotage: {
                        kind: "firewallBreach",
                      },
                    })}
                  disabled={$playerStore.role.sabotageCooldown > 0}
                  >Firewall Breach</SmallButton
                >
                <div class="text-gray-300 text-xs">
                  {FIREWALL_COOLDOWN}s cooldown
                </div>
              </div>
              <span class="text-gray-400 text-sm"
                >Forces players to go to {$lobbyStore.activities[
                  "firewallbutton1"
                ].room} and {$lobbyStore.activities["firewallbutton2"].room} to fix
                it within {FIREWALL_FIX_TIME} seconds</span
              >
            </div>

            <div class="flex flex-col">
              <div class="flex space-x-2 items-center">
                <SmallButton disabled={$playerStore.role.sabotageCooldown > 0}
                  >Hack Player</SmallButton
                >
                <div class="text-gray-300 text-xs">
                  {HACK_COOLDOWN}s cooldown
                </div>
              </div>
              <span class="text-gray-400 text-sm"
                >Hacked players can not scan anything for {HACKED_SECS} seconds.
                Interrupts any task they were doing.</span
              >
            </div>

            <div class="flex flex-col">
              <div class="flex space-x-2 items-center">
                <SmallButton
                  on:click={() =>
                    emitGameAction({
                      action: "launchSabotage",
                      sabotage: { kind: "virusScan" },
                    })}
                  disabled={$playerStore.role.sabotageCooldown > 0}
                  >Virus Scan</SmallButton
                >
                <div class="text-gray-300 text-xs">
                  {VIRUS_SCAN_COOLDOWN}s cooldown
                </div>
              </div>
              <span class="text-gray-400 text-sm"
                >Force all players doing 'Nothing' to stand still. <span
                  class="font-bold">Careful:</span
                >
                Moving may blow your cover.</span
              >
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <p>
            Ready to kill{$playerStore?.role.killCooldown
              ? ` in ${$playerStore?.role.killCooldown}`
              : ""}
          </p>
          <div class="self-center mb-2 mt-2 flex flex-col items-center">
            <ScanButton on:scanned={({ detail }) => handleScanned(detail)} />
            <span class="text-gray-400 text-xs"
              >You can also use the normal scan button to kill</span
            >
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
