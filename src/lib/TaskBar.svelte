<script lang="ts">
  export let taskProgress = 50;
</script>

<label for="taskbar">Catching the spies...</label>
<progress id="taskbar" value={taskProgress} max="100" />
