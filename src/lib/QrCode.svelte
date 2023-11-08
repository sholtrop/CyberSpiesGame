<script lang="ts">
  import QRCode from "qrcode";
  import { onMount } from "svelte";

  export let link: string;

  let canvas: HTMLCanvasElement;
  let windowWidth: number;

  $: link != null &&
    canvas != null &&
    QRCode.toCanvas(canvas, link, { width: windowWidth / 2 });
</script>

<svelte:window bind:innerWidth={windowWidth} />
<div class="flex flex-col items-center">
  <canvas
    bind:this={canvas}
    class="flex items-center justify-center p-1 border mb-2"
  />
  Players can join by scanning this QR code
</div>
