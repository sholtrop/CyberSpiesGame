<script lang="ts">
  import ScanButton from "$lib/ScanButton.svelte";
  import { gotoReplace } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";

  function completeTask(contents: string) {
    const [type, info] = contents.split(":");
    if (type === "task") {
      emitGameAction({ action: "taskCompleted", taskNumber: Number(info) });
      gotoReplace("/game");
    }
  }
</script>

<div class="h-full p-10 flex flex-col justify-between items-center">
  <div>
    <p>Task completed!</p>
  </div>
  <div>
    <p class="text-center">
      Scan the task point again to confirm your completion.
    </p>
  </div>
  <div>
    <ScanButton
      on:scanned={({ detail }) => {
        console.log("Scanned", detail);
        completeTask(detail);
      }}
    />
  </div>
</div>
