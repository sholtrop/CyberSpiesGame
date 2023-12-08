<script>
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
</script>

<div class="grid grid-cols-2 gap-4 mt-4 px-1">
  <MainButton on:click={() => goto("/minigame/0")}>0 Simon says</MainButton>
  <MainButton on:click={() => goto("/minigame/1")}>1 Wiretap</MainButton>
  <MainButton on:click={() => goto("/minigame/2")}
    >2 Password cracking</MainButton
  >
  <MainButton on:click={() => goto("/minigame/3")}>3 Mining</MainButton>
  <MainButton on:click={() => goto("/minigame/4")}>4 Virus</MainButton>
  <MainButton on:click={() => goto("/minigame/5")}>5 Sum to hundred</MainButton>
  <MainButton on:click={() => goto("/minigame/6")}>6 Delete evidence</MainButton
  >
</div>
