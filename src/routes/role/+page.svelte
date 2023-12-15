<script lang="ts">
  import { dev } from "$lib/consts";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import { lobbyStore, playerStore } from "$lib/stores";
  import { getSocketIO } from "$lib/websocket";
  import type { Socket } from "socket.io-client";
  import { onMount } from "svelte";

  let io: Socket;

  onMount(() => {
    io = getSocketIO();
    return lobbyStore.subscribe((lobby) => {
      if (lobby?.status.state === "started") goto("/game");
    });
  });
</script>

<div
  class="flex flex-col items-center justify-between min-h-screen space-y-10 py-10"
>
  <div
    class="flex flex-col items-center justify-end h-full mb-4 text-center p-10"
  >
    <p class="mb-5 text-lg">
      Your role is: <span class="font-bold"
        >{$playerStore?.role.name === "crew"
          ? "Cyber Criminal"
          : "Secret Agent"}</span
      >
    </p>

    {#if $playerStore?.role.name === "impostor"}
      <p>
        You're an undercover spy infiltrating into a criminal den. Assassinate
        the criminals or retreive the data to win.
      </p>
      <p>
        <br />You have been granted special abilities. Swipe up on the next page
        to access them.
      </p>
    {:else}
      <p>
        You're part of a cyber criminal organization. There is 1 spy amongst
        you.
      </p>
      <p>
        <br />Do your tasks to catch the spy or execute the spy during a meeting
        to win.
      </p>
    {/if}
  </div>
  {#if $lobbyStore?.status.state === "roleExplanation"}
    <MainButton
      disabled={!dev}
      on:click={() => {
        io.emit("devSetLobby", {
          lobby: { status: { state: "roleExplanation", countDown: 1 } },
        });
        goto("/game");
      }}
      >Game will start in {$lobbyStore.status.countDown}

      {#if dev}
        <br />
        <span class="text-sm text-gray-300">(Dev mode: Click to start now)</span
        >
      {/if}
    </MainButton>
  {/if}
</div>
