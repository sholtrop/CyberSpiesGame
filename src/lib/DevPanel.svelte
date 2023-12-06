<script lang="ts">
  import { DEV_PANEL_KEY } from "./consts";
  import { lobbyStore, playerStore } from "$lib/stores";
  import { emitGameAction, getSocketIO } from "./websocket";
  import type { Color } from "./types";
  import { gotoReplace } from "./util";
  import { KILL_COOLDOWN_SECS, SABO_COOLDOWN_SECS } from "../../server/consts";

  const io = getSocketIO();
  let playerColor: Color;
  if ($playerStore) {
    playerColor = $playerStore.color;
  }

  function changeTasks() {
    io.emit("devChangeTasks");
  }

  function killPlayerHandler(killedPlayer: Color) {
    emitGameAction({ action: "killPlayer", targetColor: killedPlayer });
  }

  function reportDeadBodyHandler(bodyColor: Color) {
    emitGameAction({ action: "reportDeadBody", bodyColor });
  }

  function startTaskHandler(taskNumber: number) {
    emitGameAction({ action: "startTask", taskNumber });
  }

  const buttons = {
    "Switch roles": () => {
      const players = { ...$lobbyStore!.players };
      const me = $playerStore!;
      if (me.role.name === "impostor") me.role = { name: "crew" };
      else
        me.role = {
          name: "impostor",
          killCooldown: KILL_COOLDOWN_SECS,
          sabotageCooldown: SABO_COOLDOWN_SECS,
        };
      io.emit("devSetLobby", { lobby: { players } });
    },
    "Call meeting": () => gotoReplace("/meetingbutton"),

    "Join meeting": () => {
      emitGameAction({ action: "enterMeeting" });
    },

    "Start task": () =>
      $lobbyStore != null
        ? (screen = "scanTaskScreen")
        : alert("Cannot start task as you're not in a lobby"),
    "Kill/Report player": () =>
      $lobbyStore != null
        ? (screen = "scanPlayerScreen")
        : alert("Cannot kill/report a player as you're not in a lobby"),
    "Start sabotage fix": () =>
      $lobbyStore != null
        ? emitGameAction({ action: "startSabotageFix" })
        : alert("Cannot fix sabotage as you're not in a lobby"),
    "Trigger victory": () =>
      $playerStore?.role.name !== "undecided"
        ? io.emit("devSetLobby", {
            lobby: {
              status: { state: "gameEnded", victors: $playerStore?.role },
            },
          })
        : alert("Role is 'undecided', cannot trigger victory"),
  };

  let screen = "main" as "main" | "scanPlayerScreen" | "scanTaskScreen";
</script>

<div class="inset-0 absolute h-min flex m-6 z-10 bg-green-800 text-white">
  <div class="flex flex-col items-center px-2 py-4 w-full">
    {#if screen === "main"}
      <h1 class="text-2xl font-semibold m-2 flex flex-col items-center">
        Dev Panel
        <br />
        <span class="text-sm text-green-200"
          >(press Ctrl {DEV_PANEL_KEY} to close)</span
        >
      </h1>
      <div class="grid grid-cols-2 grid-rows-4 gap-y-4 gap-x-4 mt-4">
        {#each Object.entries(buttons) as [btn, action]}
          <button class="border text-white border-white p-3" on:click={action}
            >{btn}</button
          >
        {/each}
      </div>
    {:else if screen === "scanPlayerScreen" && $lobbyStore != null}
      <div class="w-full flex justify-center flex-col items-center">
        <button
          class="text-green-200 px-4 py-2 self-start"
          on:click={() => (screen = "main")}>Back</button
        >
        <h1
          class="text-2xl text-white font-semibold m-2 flex flex-col items-center"
        >
          Kill/Report player
        </h1>
        <div class="grid grid-cols-2 grid-rows-4 gap-y-4 gap-x-4 mt-4">
          {#each Object.values($lobbyStore.players) as player}
            {#if player.status === "alive"}
              <button
                class="border text-white border-green-300 p-3"
                on:click={() => killPlayerHandler(player.color)}
                >Kill {player.name} ({player.color})</button
              >
            {:else if player.status === "dead"}
              <button
                class="border text-white border-green-300 p-3"
                on:click={() => reportDeadBodyHandler(player.color)}
                >Report {player.name}'s ({player.color}) dead body</button
              >
            {:else}
              <div class="border text-green-300 border-green-300 p-3">
                {player.name} ({player.color}) is found dead
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {:else if screen === "scanTaskScreen" && $lobbyStore != null && $playerStore != null}
      <div class="w-full flex justify-center flex-col items-center">
        <button
          class="text-green-200 px-4 py-2 self-start"
          on:click={() => (screen = "main")}>Back</button
        >
        <h1
          class="text-2xl text-white font-semibold m-2 flex flex-col items-center"
        >
          Start Task
        </h1>
        <div class="flex flex-col items-center">
          <button
            on:click={changeTasks}
            class="border-green-200 border px-2 py-2">Cycle tasks</button
          >
          <div class="grid grid-cols-2 grid-rows-4 gap-y-4 gap-x-4 mt-4">
            {#each $playerStore.tasks as task}
              <button
                class="border text-white border-green-300 p-3"
                on:click={() => startTaskHandler(task.number)}
                >Start task {task.number}<br />(status: {task.status})</button
              >
            {/each}
          </div>
          {#if $playerStore.tasks.length === 0}
            <div class="w-full text-center">
              You don't have any tasks yet.<br />Using Cycle Tasks will give you
              three new ones
            </div>
          {/if}
        </div>
      </div>
    {/if}
    <h1 class="text-lg font-semibold m-2 flex flex-col items-center">
      Status info
    </h1>
    <div class="grid grid-cols-2">
      <div>Color: <span class="font-semibold">{$playerStore?.color}</span></div>
      <div>
        Role: <span class="font-semibold">{$playerStore?.role.name}</span>
        {#if $playerStore?.role.name === "impostor"}
          <div class="text-sm ml-4">
            Kill CD:
            <span class="font-bold">{$playerStore?.role.killCooldown}</span><br
            />
            Sabo CD:
            <span class="font-bold">{$playerStore?.role.sabotageCooldown}</span>
          </div>
        {/if}
      </div>

      <div>
        Status: <span class="font-semibold">{$playerStore?.status}</span>
      </div>
      <div>
        Activity: <span class="font-semibold"
          >{$playerStore?.currentlyDoing.activity}</span
        >
      </div>
      <div>
        Tasks: <span class="text-sm"
          >{($playerStore?.tasks.length ?? 0) > 0
            ? $playerStore?.tasks.reduce(
                (list, t) => (list += `${t.name}(${t.number}), `),
                ""
              )
            : "none"}</span
        >
      </div>
      <div>
        Lobby state:
        <span class="font-semibold">{$lobbyStore?.status.state}</span>
      </div>

      <div>
        Active effects:
        <span class="font-semibold"
          >{($lobbyStore?.activeEffects.length ?? 0) > 0
            ? $lobbyStore?.activeEffects.reduce(
                (list, effect) => (list += `${effect.effect}, `),
                ""
              )
            : "none"}</span
        >
      </div>
    </div>
  </div>
</div>
