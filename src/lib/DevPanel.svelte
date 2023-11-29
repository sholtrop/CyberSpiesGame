<script lang="ts">
  import { DEV_PANEL_KEY } from "./consts";
  import { lobbyStore, playerStore } from "$lib/stores";
  import { getSocketIO } from "./websocket";
  import type { GameAction } from "./types";

  const io = getSocketIO();

  function changeTasks() {
    io.emit("devChangeTasks");
  }

  const buttons = {
    "Switch roles": () => {
      const players = { ...$lobbyStore!.players };
      const me = $playerStore!;
      if (me.role === "impostor") me.role = "crew";
      else me.role = "impostor";
      io.emit("devSetLobby", { lobby: { players } });
    },
    "Call meeting": () => {
      io.emit("gameAction", {
        action: "callMeeting",
        type: "emergency",
      } as GameAction);
    },
    "Start task": () =>
      $lobbyStore != null
        ? (screen = "scanTaskScreen")
        : alert("Cannot start task as you're not in a lobby"),
    "Kill player": () =>
      $lobbyStore != null
        ? (screen = "scanPlayerScreen")
        : alert("Cannot kill a player as you're not in a lobby"),
  };

  let screen = "main" as "main" | "scanPlayerScreen" | "scanTaskScreen";
</script>

<div class="inset-0 absolute flex m-20 z-10 bg-green-800 text-white">
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
          Kill player
        </h1>
        <div class="grid grid-cols-2 grid-rows-4 gap-y-4 gap-x-4 mt-4">
          {#each Object.values($lobbyStore.players) as player}
            <button
              class="border text-white border-green-300 p-3"
              on:click={() =>
                io.emit("killPlayer", { playerColor: player.color })}
              >Kill {player.name} ({player.color})</button
            >
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
                on:click={() =>
                  io.emit("gameAction", {
                    action: "startTask",
                    taskNumber: task.number,
                  })}
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
  </div>
</div>
