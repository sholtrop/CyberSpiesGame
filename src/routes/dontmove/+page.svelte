<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import { VIRUS_FAIL_TIME, VIRUS_SCAN_TIME } from "$lib/consts";
  import { onMount } from "svelte";
  let x_diff: number, y_diff: number, z_diff: number;
  let hasAccelerometer = false;
  let moved = false;
  let overallMovement = 0;

  let scanFailedCounter = VIRUS_FAIL_TIME;
  function virusScanFailed() {
    const cancel = setInterval(() => {
      scanFailedCounter -= 1;
      if (scanFailedCounter === 0) {
        clearInterval(cancel);
        goto("/game", { replaceState: true });
      }
    }, 1000);
  }

  let virusScanCounter = VIRUS_SCAN_TIME;
  function startVirusScan() {
    const cancel = setInterval(() => {
      virusScanCounter -= 1;
      if (moved) {
        clearInterval(cancel);
        virusScanFailed();
      }

      if (virusScanCounter === 0) {
        clearInterval(cancel);
        goto("/game", { replaceState: true });
      }
    }, 1000);
  }

  // 5 secs till virus scan starts
  let beforeStartCounter = 5;
  onMount(() => {
    hasAccelerometer = "Accelerometer" in window;

    const cancel = setInterval(() => {
      beforeStartCounter -= 1;
      if (beforeStartCounter === 0) {
        clearInterval(cancel);
        startVirusScan();
      }
    }, 1000);

    if (hasAccelerometer) {
      const acl = new Accelerometer({ frequency: 10 });

      acl.start();
      let old_coords = [null, null, null] as (number | null)[];

      setInterval(() => {
        const x = Math.round(Math.abs(acl.x ?? 0) * 100) / 100;
        const y = Math.round(Math.abs(acl.y ?? 0) * 100) / 100;
        const z = Math.round(Math.abs(acl.z ?? 0) * 100) / 100;

        if (old_coords[0] == null) {
          old_coords = [x, y, z];
          return;
        }

        x_diff = Math.round(Math.pow(x - old_coords[0]!, 2) * 100) / 100;
        y_diff = Math.round(Math.pow(y - old_coords[1]!, 2) * 100) / 100;
        z_diff = Math.round(Math.pow(z - old_coords[2]!, 2) * 100) / 100;
        overallMovement = Math.round((x_diff + y_diff) * 100) / 100;
        if (overallMovement > 0.5 && moved !== true) {
          moved = true;
        }
        old_coords = [x, y, z];
      }, 500);
    }
  });
</script>

<div
  class="text-xl text-white flex flex-col
  items-center justify-center min-h-screen pb-20"
>
  {#if beforeStartCounter > 0}
    Virus scan incoming in {beforeStartCounter}...<br />
    Do not move during the virus scan!
  {:else if hasAccelerometer || dev}
    <div>
      {#if moved}
        You moved! You are locked out of tasks for {scanFailedCounter} seconds
      {:else}
        Virus scan ongoing for {virusScanCounter} seconds<br />
        Stand still ...
      {/if}
    </div>
  {:else}
    Virus scan ongoing for {virusScanCounter} seconds<br />
    Stand still ...
  {/if}
</div>
