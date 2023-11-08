<script lang="ts">
  export let roomLink: string;
  let linkCopied = false;

  function copyToClipboard() {
    navigator.clipboard.writeText(roomLink).then(() => {
      linkCopied = true;
      setTimeout(() => (linkCopied = false), 3500);
    });
  }
</script>

<div class="flex flex-col items-center">
  <button on:click={copyToClipboard} class="text-blue-500 underline inline"
    >{roomLink}</button
  >
  <div class="h-5 text-gray-400">
    {#if linkCopied}Copied link to clipboard {/if}
  </div>
</div>
