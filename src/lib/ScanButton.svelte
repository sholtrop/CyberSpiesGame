<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { scanNfc } from "./util";

  const dispatch = createEventDispatcher();
  const SCAN_TIMEOUT = 8;

  export let disabled = false;
  let scanning = false;
  let cancelScan: (() => void) | null = null;

  async function scan() {
    scanning = true;
    const [cancel, scanPromise] = scanNfc({ timeOutSecs: SCAN_TIMEOUT });
    cancelScan = cancel;

    const scanResult = await scanPromise;
    // Only emit if we didnt cancel in the meantime
    if (scanResult != null && scanning) {
      dispatch("scanned", { result: scanResult });
      msg = scanResult ?? "Scanned nothing";
    }
    scanning = false;
  }

  function cancel() {
    if (cancelScan != null) {
      cancelScan();
      scanning = false;
    }
  }

  let msg = "";
</script>

<button
  on:click={() => (scanning ? cancel() : scan())}
  class="border h-20 px-6 text-lg border-green-600 disabled:text-gray-400 min-w-[12rem]"
  class:scanning
  {disabled}
>
  {#if scanning}
    Scanning <br /><span class="text-xs">tap to cancel</span>
  {:else}
    Scan
  {/if}</button
>
<br />
{msg}

<style>
  @keyframes gradientAnimation {
    0% {
      background-position: 0% 0%;
    }
    50% {
      background-position: 100% 100%;
    }
    100% {
      background-position: 200% 200%;
    }
  }

  .scanning {
    @apply from-green-500 to-green-900 via-green-700 bg-gradient-to-r;
    background-size: 300% 100%; /* Adjust based on the number of colors in the gradient */
    animation: gradientAnimation 2s linear infinite;
  }
</style>
