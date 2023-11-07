<script lang="ts">
  export let playerName: string;
  export let showError: boolean;
</script>

<div>
  <label for="nameInput" class="block">Enter your name:</label>
  <input
    id="nameInput"
    type="text"
    bind:value={playerName}
    class="text-black px-2 py-3 mt-1"
  />
  {#if showError}
    <p class="text-red-500">Please enter a name.</p>
  {/if}
</div>
