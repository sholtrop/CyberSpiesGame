<script lang='ts'>
  export let taskProgress: number = 50 ;
</script>

<label for="taskbar">Catching the spies...</label>
<progress id="taskbar" value={taskProgress} max="100"></progress>