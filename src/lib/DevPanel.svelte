<script lang="ts">
  import { DEV_PANEL_KEY, N_TOTAL_TASKS } from "./consts";
  import { lobbyStore, playerStore } from "./lobbyStore";
  import { getSocketIO } from "./websocket";

  const io = getSocketIO();

  let startTask = 0;
  function cycleTasks() {
    const players = [...$lobbyStore!.players];
    const me = $playerStore!;
    me.tasks = [];
    let i = startTask;
    while (me.tasks.length != 3) {
      me.tasks.push({ number: i, status: "available" });
      i = (i + 1) % N_TOTAL_TASKS;
    }
    startTask = (startTask + 3) % N_TOTAL_TASKS;
    io.emit("devSetLobby", { lobby: { players } });
  }

  const buttons = {
    "Make me impostor": () => {
      const players = [...$lobbyStore!.players];
      const me = $playerStore!;
      me.role = "impostor";
      io.emit("devSetLobby", { lobby: { players } });
    },
    "Scan meeting point": () => {
      io.emit("nfcScanned", { nfcTag: "meeting:button" });
    },
    "Scan task": () =>
      $lobbyStore != null
        ? (screen = "scanTaskScreen")
        : alert("Cannot scan task as you're not in a lobby"),
    "Scan player": () =>
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
          Scan player
        </h1>
        <div class="grid grid-cols-2 grid-rows-4 gap-y-4 gap-x-4 mt-4">
          {#each $lobbyStore.players as player}
            <button
              class="border text-white border-green-300 p-3"
              on:click={() =>
                io.emit("nfcScanned", { nfcTag: `player:${player.color}` })}
              >Scan {player.name} ({player.color})</button
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
          Scan Task
        </h1>
        <div class="flex flex-col items-center">
          <button
            on:click={cycleTasks}
            class="border-green-200 border px-2 py-2">Cycle tasks</button
          >
          <div class="grid grid-cols-2 grid-rows-4 gap-y-4 gap-x-4 mt-4">
            {#each $playerStore.tasks as task}
              <button
                class="border text-white border-green-300 p-3"
                on:click={() =>
                  io.emit("nfcScanned", { nfcTag: `task:${task.number}` })}
                >Scan task {task.number}<br />(status: {task.status})</button
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
