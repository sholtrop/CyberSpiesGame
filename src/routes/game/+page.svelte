<script lang="ts">
  import ScanButton from "$lib/ScanButton.svelte";
  import SmallButton from "$lib/SmallButton.svelte";
  import TaskBar from "$lib/TaskBar.svelte";
  import { COLORS } from "$lib/consts";
  import { lobbyStore, playerColorStore, playerStore } from "$lib/stores";
  import { gotoReplace } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";
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

  let mainDiv: HTMLDivElement;
  let spyDiv: HTMLDivElement;
  onMount(() => {
    if ($lobbyStore == null || $playerStore == null) gotoReplace(`/`);
    scrollUp();
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

  function pressHandler(task: number) {
    if ($playerStore?.role.name === "impostor") {
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

    {#if $playerStore.role.name === "impostor"}
      <div
        bind:this={spyDiv}
        class="px-10 flex flex-col justify-between"
        style="height: calc(100vh - 2.5rem)"
      >
        <div class="h-24 mt-2">
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
              <div class="flex items-baseline space-x-1.5">
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
            <!-- TODO: grey out buttons when cd is up -->
            <div class="flex flex-col">
              <div class="flex space-x-2 items-center">
                <SmallButton>Firewall Breach</SmallButton>
                <div class="text-gray-400 text-sm">
                  {FIREWALL_COOLDOWN}s cooldown
                </div>
              </div>
              <span class="text-gray-300 text-sm"
                >Will force players to go to {$lobbyStore.activities[
                  "firewallbutton1"
                ].room} and {$lobbyStore.activities["firewallbutton2"].room} to fix
                it within {FIREWALL_FIX_TIME} seconds</span
              >
            </div>

            <div class="flex flex-col">
              <div class="flex space-x-2 items-center">
                <SmallButton>Hack Player</SmallButton>
                <div class="text-gray-400 text-sm">
                  {HACK_COOLDOWN}s cooldown
                </div>
              </div>
              <span class="text-gray-300 text-sm"
                >The player you hack can not scan anything for {HACKED_SECS} seconds</span
              >
            </div>

            <div class="flex flex-col">
              <div class="flex space-x-2 items-center">
                <SmallButton>Virus Scan</SmallButton>
                <div class="text-gray-400 text-sm">
                  {VIRUS_SCAN_COOLDOWN}s cooldown
                </div>
              </div>
              <span class="text-gray-300 text-sm"
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
              : ""}.
          </p>
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
