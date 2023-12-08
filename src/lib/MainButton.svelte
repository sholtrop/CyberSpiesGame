<script lang="ts">
  export let disabled = false;
</script>

<button
  on:click
  class="border px-4 py-4 text-lg border-green-600 disabled:text-gray-400 w-full max-w-[12rem]"
  {disabled}
>
  <slot /></button
>
