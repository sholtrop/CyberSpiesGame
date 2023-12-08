<script lang="ts">
  import Header from "$lib/Header.svelte";
  import MainButton from "$lib/MainButton.svelte";
    import { gotoReplace } from "$lib/util";
    import { emitGameAction } from "$lib/websocket";
    import { onMount } from "svelte";
    import { TASKS } from "../../../server/consts";

  const N_WINS_REQUIRED = 4;

  let buttonlit = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  let mistake = false;
  let sequence = Array(N_WINS_REQUIRED);
  let level = 0;
  let nextclick = 0;
  let started = false;

  onMount(() => {
    emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "simonsays")});
  });

  function handleClick(index: number) {
    if (index === sequence[nextclick]) {
      if (nextclick < level) {
        nextclick += 1;
      }
      if (nextclick === level) {
        if (level === sequence.length) {
          reset();
          setTimeout(() => gotoReplace("/minigamedone"), 300);
        } else {
          level += 1;
          nextclick = 0;
          setTimeout(() => showSequence(level), 1500);
        }
      }
    } else {
      mistake = true;
      started = false;
      level = 0;
      nextclick = 0;
      setTimeout(() => {
        mistake = false;
        showSequence(level);
      }, 1500);
    }

    buttonlit[index] = true;
    setTimeout(() => {
      buttonlit[index] = false;
    }, 300);

    return;
  }

  function lightUpNext(index: number, total: number) {
    if (index >= total) {
      return;
    }
    buttonlit[sequence[index]] = true;
    setTimeout(lightUpNext, 1000, index + 1, total);
    setTimeout(() => {
      buttonlit[sequence[index]] = false;
    }, 900);
  }
  function showSequence(total: number) {
    if (total > sequence.length) {
      return;
    }
    lightUpNext(0, total);
  }

  function reset() {
    level = 1;
    nextclick = 0;
    for (var i = 0; i < sequence.length; i++) {
      sequence[i] = Math.floor(Math.random() * 9);
    }
  }
</script>

<div class="flex flex-col justify-between items-center mt-10">
  <Header>Repeat the pattern that lights up</Header>
  <p class="text-sm text-gray-300 text-center">
    Must complete {N_WINS_REQUIRED} times.<br /> Pattern becomes more difficult each
    time.
  </p>
  <div class="grid grid-cols-3 grid-rows-3 gap-6 mt-8">
    {#each Array(9) as _, i}
      <button
        class="btn"
        disabled={!started}
        class:btn-light-up={buttonlit[i] && !mistake}
        class:btn-wrong={buttonlit[i] && mistake}
        on:click={() => handleClick(i)}
      />
    {/each}
  </div>
  <div class="mt-8">
    <MainButton
      on:click={() => {
        reset();
        started = true;
        showSequence(level);
      }}>{started ? "Restart" : "Start"}</MainButton
    >
  </div>
</div>

<style>
  .btn {
    @apply font-bold py-6 px-6 rounded bg-green-700 border border-green-400;
  }
  .btn-light-up {
    @apply bg-green-400;
  }
  .btn-wrong {
    @apply bg-red-600;
  }
</style>
