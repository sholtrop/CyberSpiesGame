<script lang="ts">
  import {onMount} from 'svelte';

  let container: HTMLElement;
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

  function addPlayer(playerName: string, color: string) {
    onMount(() => {   
      let child: HTMLElement = document.createElement('div');
      child.classList.add("flex", "items-baseline", "space-x-1.5");
  
      let grandchild1: HTMLElement = document.createElement('div');
      grandchild1.classList.add("w-3", "h-3");
      grandchild1.classList.add(colors[color]);
      child.appendChild(grandchild1);
      
      let grandchild2: HTMLElement = document.createElement('div');
      grandchild2.textContent = playerName;
      child.appendChild(grandchild2);
  
      container.appendChild(child);
    });
  }

  for (let i in players) {
    addPlayer(players[i]["name"], players[i]["color"]);
  }

</script>

<div bind:this={container}>
  <div class="title text-5xl my-5">Cyber Spy</div>
</div>

<style lang="scss">
</style>
