<script lang="ts">
  import { onMount } from "svelte";
  import * as socketIO from "socket.io-client";

  let hasNfc = false;
  let isSecureContext = false;
  let msg = `Web NFC test`;
  let mainDiv: HTMLDivElement;
  let nfcMessage = ``;

  onMount(() => {
    if ("NDEFReader" in window) hasNfc = true;
    if (window.isSecureContext) isSecureContext = true;
    initSocketIO();
  });

  function log(message: string) {
    msg = message;
  }

  async function startNfc() {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      log(`Scanning...`);
      ndef.onreadingerror = (err) =>
        log(`Cannot read data from the NFC tag: ${err}`);

      ndef.onreading = (event) => {
        let msg = ``;
        event.message.records.forEach((m) => {
          const textDecoder = new TextDecoder();
          msg += textDecoder.decode(m.data);
        });
        log(`Got msg from NFC tag:`);
        nfcMessage = msg;
      };
      return true;
    } catch (err) {
      if (err instanceof Error) log(err.toString());
      else log(`> Unknown error occurred while activating NFC reader`);
    }
  }

  function initSocketIO() {
    socketIO.connect(`http://localhost:3000`).on("connect", () => {
      console.debug(`Connected to socketIO`);
    });
  }

  function goFullScreen() {
    mainDiv.requestFullscreen();
  }
</script>

<div
  bind:this={mainDiv}
  class="text-white bg-black min-h-screen flex flex-col items-center pt-20"
>
  <div>{msg}</div>
  <div>
    {nfcMessage}
  </div>

  {#if !hasNfc}
    x No NFC API
  {:else if !isSecureContext}
    x Is not secure context
  {:else}
    <button
      class="border-2 py-3 px-8 mt-4"
      on:click={async () => (await startNfc()) && goFullScreen()}>Scan</button
    >
  {/if}
</div>
