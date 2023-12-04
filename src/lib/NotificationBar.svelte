<script lang="ts">
  export let notificationMessage: string | null;
</script>

<div
  class="w-screen bg-green-900 text-green-50 h-10 flex flex-col justify-center items-center"
>
  <p>
    {#if notificationMessage !== null}
      {notificationMessage}
    {/if}
  </p>
</div>
