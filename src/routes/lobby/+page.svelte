<script lang="ts">
  import {onMount} from 'svelte';
  import { getSocketIO } from "$lib/websocket";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import Title from "$lib/Title.svelte";

  let container: HTMLElement;
  let linkContainer: HTMLElement;
  let qrContainer: HTMLElement;
  let roomLink: string;
  const players = [
    { name: "Lochyin", color: "green" },
    { name: "Salih", color: "blue" },
    { name: "Amber", color: "yellow" },
    { name: "Steef", color: "orange"},
    { name: "Sjors", color: "red" }
  ];
  const colors = {
    red: "bg-red-700",
    orange: "bg-orange-500",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    blue: "bg-blue-600",
  } as { [key: string]: string };

  function getRoomLink(): string {
    let link: string = "https://test.com";
    return link;
  }

  function showRoomLink() {
    onMount(() => {
      let link: string = getRoomLink();
      linkContainer.innerText = "Roomlink: \n" + link;
    });
  }


  function addPlayer(name: string, color: string) {
    players.push({name, color});
  }

  function startGame() {
    getSocketIO();
    goto("/role", {replaceState: true});
  }

  showRoomLink();


</script>
<div class="min-h-full h-1x flex flex-col justify-between">
  <div>
    <Title></Title>
    <div class="my-10">
      <p bind:this={linkContainer}>Roomlink: </p>
      <div bind:this={qrContainer}></div>
    </div>
    <div>
      <h2>Players:</h2>
      <div bind:this={container}>
        {#each players as player}
        <div class="flex items-baseline space-x-1.5">
          <div class={colors[player.color] + " w-3 h-3"} />
          <div>{player.name}</div>
        </div>
      {/each}
      </div>
    </div>
  </div>
  <MainButton on:click={() => startGame()}>Start Game</MainButton>
</div>

<style lang="scss">
</style>
