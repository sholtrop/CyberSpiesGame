<script lang="ts">
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";

  let winningRole: string;

  const players = [
    {
      name: "Lochyin",
      color: "green",
      status: "alive",
      role: "Cyber Criminal",
    },
    { name: "Salih", color: "blue", status: "alive", role: "Spy" },
    { name: "Amber", color: "yellow", status: "dead", role: "Cyber Criminal" },
    { name: "Steef", color: "white", status: "dead", role: "Cyber Criminal" },
    { name: "Sjors", color: "red", status: "dead", role: "Cyber Criminal" },
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

  function gotoLobby() {
    goto("/lobby", { replaceState: true });
  }

  function setWinnerRole() {
    let winner = "Spy";
    winningRole = winner;
  }

  setWinnerRole();
</script>

<div class="h-full flex flex-col justify-between items-center">
  <div>
    <p class="text-2xl mb-10 text-center">{winningRole} Victory</p>
    <div>
      {#each players as player}
        <div class="flex items-baseline space-x-1.5">
          <div class={colors[player.color] + " w-3 h-3"} />
          <div>{player.name} ({player.role}) - {player.status}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="mb-10">
    <MainButton on:click={gotoLobby}>Play Again</MainButton>
  </div>
</div>
