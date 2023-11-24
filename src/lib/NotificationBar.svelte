<script lang="ts">
  export let notificationMessage: string;
</script>

<div class="absolute z-5 w-screen top-5 bg-green-600 h-12 flex flex-col justify-center items-center">
  <p>{notificationMessage}</p>
</div>