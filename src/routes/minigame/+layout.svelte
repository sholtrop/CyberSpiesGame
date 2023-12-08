<script>
  import { gotoReplace } from "$lib/util";
</script>

<div class="border-b w-full flex flex-col items-center pb-4 border-gray-300">
  <button
    class="mt-4 w-1/2 px-3 py-2 bg-gray-800 rounded-sm text-gray-200"
    on:click={() => gotoReplace("/game")}>Cancel Task</button
  >
</div>
<slot />
