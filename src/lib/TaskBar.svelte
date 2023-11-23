<script lang="ts">
  export let taskProgress = 50;
</script>

<div class="flex flex-col space-y-1">
  <label for="taskbar" class="text-lg">Task progress</label>
  <progress
    id="taskbar"
    class="border border-gray-600 w-full"
    value={taskProgress}
    max="100"
  />
</div>

<style>
  /* Only works on Chrome */
  #taskbar::-webkit-progress-value {
    @apply bg-green-700;
  }
  #taskbar::-webkit-progress-bar {
    @apply bg-black;
  }
</style>
