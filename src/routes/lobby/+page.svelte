<script lang="ts">
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import QrCode from "$lib/QrCode.svelte";
  import { onMount } from "svelte";
  import { lobbyStore } from "$lib/lobbyStore";
  import InviteLink from "$lib/InviteLink.svelte";
  import type { Socket } from "socket.io-client";

  let socket: Socket;
  let roomLink: string;

  onMount(() => {
    if ($lobbyStore == null) {
      // You can only access this page if you're in a lobby
      goto("/", { replaceState: true });
    }
    roomLink = getRoomLink();
    socket = getSocketIO();

    socket.on("lobbyUpdate", ({ lobby }) => {
      console.debug(`lobbyupdate`, { lobby });
      lobbyStore.set(lobby);
    });

    // From `onMount` we can return a cleanup function that Svelte runs whenever a component unmounts (disappears).
    // At the very least, we need to unsub from socketIO events that only this page needs.
    return () => {
      socket.removeAllListeners("lobbyUpdate");
    };
  });

  const colors = {
    red: "bg-red-600",
    orange: "bg-orange-600",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    blue: "bg-blue-600",
    purple: "bg-purple-700",
    white: "bg-white",
  } as { [key: string]: string };

  function getRoomLink(): string {
    let link = window.location.origin + `/join?code=${$lobbyStore?.id}`;
    return link;
  }

  function startGame() {
    goto("/role", { replaceState: true });
  }
</script>

{#if $lobbyStore != null}
  <div class="min-h-full flex flex-col justify-between">
    <div class="flex flex-col items-center">
      <Title />
      <div class="my-10 flex flex-col items-center">
        <p class="text-center mb-3">
          Invite Link: <br />
          <InviteLink {roomLink} />
        </p>
        <QrCode link={roomLink} />
      </div>
      <div>
        <h2 class="font-bold text-lg">Players:</h2>
        <div class="grid grid-rows-4 grid-cols-3 gap-x-3 gap-y-1">
          {#each $lobbyStore.players as { name, color }}
            <div class="flex items-baseline space-x-1.5 w-24">
              <div class={colors[color] + " w-3 h-3"} />
              <div>{name}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="mb-10 flex justify-center">
      <MainButton on:click={() => startGame()}>Start Game</MainButton>
    </div>
  </div>
{/if}
