<script lang="ts">
  import QRCode from "qrcode";

  export let link: string;

  const bgColor = 0x1b5c04;

  let canvas: HTMLCanvasElement;
  let windowWidth: number;

  $: windowWidth, link != null && canvas != null && renderQRCode();

  function renderQRCode() {
    QRCode.toCanvas(canvas, link, { width: windowWidth / 2 });
    const arr = canvas
      .getContext("2d")
      ?.getImageData(0, 0, canvas!.width, canvas!.height)!;

    for (let i = 0; i < arr.height * arr.width * 4; i += 4) {
      let [r, g, b] = [arr.data[i], arr.data[i + 1], arr.data[i + 2]];
      if (r + g + b !== 0) {
        r = bgColor & 0xff;
        g = (bgColor >> 8) & 0xff;
        b = (bgColor >> 16) & 0xff;
      }
      arr.data[i] = r;
      arr.data[i + 1] = g;
      arr.data[i + 2] = b;
    }
    canvas.getContext("2d")?.putImageData(arr, 0, 0);
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />
<div class="flex flex-col items-center">
  <canvas
    bind:this={canvas}
    class="flex items-center justify-center p-1 mb-2"
  />
  Players can join by scanning this QR code
</div>
