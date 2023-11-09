<script lang="ts">
  export let disabled = false;
</script>

<button
  on:click
  class="border px-6 py-4 text-lg border-green-600 disabled:text-gray-400 min-w-[12rem]"
  {disabled}
>
  <slot /></button
>
