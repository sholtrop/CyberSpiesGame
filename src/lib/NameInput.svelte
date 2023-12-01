<script lang="ts">
  export let playerName: string;
</script>

<div>
  <label for="nameInput" class="block">Enter your name:</label>
  <input
    id="nameInput"
    type="text"
    bind:value={playerName}
    class="text-black px-2 py-3 mt-1"
  />
</div>
