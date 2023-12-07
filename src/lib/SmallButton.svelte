<script lang="ts">
  export let disabled = false;
</script>

<button
  {disabled}
  on:click
  class="border px-1 py-2 text-md border-green-600 w-1/2 disabled:text-gray-400"
>
  <slot /></button
>
