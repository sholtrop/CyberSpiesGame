<script lang="ts">
  import { onMount } from "svelte";
  let x_diff: number, y_diff: number, z_diff: number;
  let hasAccelerometer = false;
  let moved = false;
  let overallMovement = 0;
  onMount(() => {
    hasAccelerometer = "Accelerometer" in window;

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
          setTimeout(() => (moved = false), 4000);
        }

        old_coords = [x, y, z];
      }, 500);
    }
  });
</script>

<div class="text-xl text-white">
  {#if hasAccelerometer}
    <div>
      {#if moved}
        You moved!
      {:else}
        Stand still...
      {/if}<br />
      <!-- x: {x_diff}<br /> y: {y_diff} <br /> z: {z_diff}<br />
      overall: {overallMovement} -->
    </div>
  {:else}
    No accelerometer API available
  {/if}
</div>
