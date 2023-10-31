<script lang="ts">
  const players = [
    { name: "Lochyin", color: "red" },
    { name: "Amber", color: "yellow" },
    { name: "Sjors", color: "green" },
  ];
  const colors = {
    red: "bg-red-700",
    orange: "bg-orange-500",
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    blue: "bg-blue-600",
  } as { [key: string]: string };
</script>

<div>
  <div class="title">Cyber Spy</div>
  {#each players as player}
    <div class="flex items-baseline space-x-1.5">
      <div class={colors[player.color] + " w-3 h-3"} />
      <div>{player.name}</div>
    </div>
  {/each}
</div>

<style lang="scss">
</style>
