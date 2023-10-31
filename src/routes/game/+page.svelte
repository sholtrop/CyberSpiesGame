<script lang="ts">
  let mainDiv: HTMLDivElement;
  function goFullScreen() {
    mainDiv.requestFullscreen();
  }

  async function startNfc() {
    try {
      const ndef = new NDEFReader();
      await ndef.scan();
      console.debug(`Scanning...`);
      ndef.onreadingerror = (err) =>
        console.error(`Cannot read data from the NFC tag: ${err}`);

      ndef.onreading = (event) => {
        let msg = ``;
        event.message.records.forEach((m) => {
          const textDecoder = new TextDecoder();
          msg += textDecoder.decode(m.data);
        });
        console.debug(`Got msg from NFC tag:`);
      };
      return true;
    } catch (err) {
      if (err instanceof Error) console.log(err.toString());
      else
        console.debug(`> Unknown error occurred while activating NFC reader`);
    }
  }
</script>

<div bind:this={mainDiv}>x</div>
