<script lang="ts">
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";
  import QrCode from "$lib/QrCode.svelte";
  import { onMount } from "svelte";

  let lobbyCode = `placeholder_lobbycode`;
  let roomLink: string;

  onMount(() => {
    roomLink = getRoomLink();
  });

  const players = [
    { name: "Lochyin", color: "green" },
    { name: "Salih", color: "blue" },
    { name: "Amber", color: "yellow" },
    { name: "Steef", color: "white" },
    { name: "Sjors", color: "red" },
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

  function getRoomLink(): string {
    // TODO: Get roomcode from the server, then make the link like /lobby?code={your lobby code here}
    let link: string = window.location.origin + `/lobby?code=${lobbyCode}`;
    return link;
  }

  function addPlayer(name: string, color: string) {
    players.push({ name, color });
  }

  function startGame() {
    goto("/role", { replaceState: true });
  }
</script>

<div class="min-h-full flex flex-col justify-between">
  <div>
    <Title />
    <div class="my-10">
      <p>Roomlink: {roomLink}</p>
      <QrCode />
    </div>
    <div>
      <h2>Players:</h2>
      {#each players as player}
        <div class="flex items-baseline space-x-1.5">
          <div class={colors[player.color] + " w-3 h-3"} />
          <div>{player.name}</div>
        </div>
      {/each}
    </div>
  </div>
  <MainButton on:click={() => startGame()}>Start Game</MainButton>
</div>
