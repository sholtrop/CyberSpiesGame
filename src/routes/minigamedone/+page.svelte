<script lang="ts">
  import ScanButton from "$lib/ScanButton.svelte";
    import { gotoReplace } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";

  function completeTask(contents: any) {
    // emitGameAction({action: "taskCompleted", taskNumber}); // TODO: get tasknumber from string
    gotoReplace("/game");
  }

</script>

<div class="h-full p-10 flex flex-col justify-between items-center">
  <div>
    <p>Task completed!</p>
  </div>
  <div>
    <p class="text-center">Please scan the task point again to confirm your completion.</p>
  </div>
  <div>
    <ScanButton
    on:scanned={(contents) => {
      console.log("Scanned", contents);
      completeTask(contents);
    }}
    />
  </div>
</div>