<script lang="ts">
  import { dev } from "$app/environment";
  import MainButton from "$lib/MainButton.svelte";
  let mainDiv: HTMLDivElement;
  let taskListDiv: HTMLUListElement;
  let tasks: { name: string; room: string }[] = [];

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

  function scanNFC() {}

  function addTask(name: string, room: string) {
    tasks = [...tasks, { name: name, room: room }];
  }

  function addFakeTasks() {
    addTask("Strengthen firewall", "Room 302/304");
  }

  if (dev) addFakeTasks();
</script>

<div bind:this={mainDiv} class="min-h-full flex flex-col justify-between">
  <div>
    <p class="text-lg">Tasks:</p>
    <ul bind:this={taskListDiv} class="list-disc list-inside">
      {#each tasks as task}
        <li><span>{task.name}</span> <span>{task.room}</span></li>
      {/each}
    </ul>
  </div>
  <div class="self-center">
    <MainButton on:click={() => scanNFC()}>Scan</MainButton>
  </div>
</div>
