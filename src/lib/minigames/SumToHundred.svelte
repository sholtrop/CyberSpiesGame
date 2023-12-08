<script lang="ts">
  import Header from "$lib/Header.svelte";
  import { gotoReplace, makeNumberListWith100Sum } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";
  import { createEventDispatcher, onMount } from "svelte";
  import { TASKS } from "../../../server/consts";

  // How many times the minigame has to be repeated before completing
  export let nRepeats = 3;
  export let numbersInMinigame = 12;

  // onMount(() => {
  //   emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "sumtohundred")});
  // });

  const dispatch = createEventDispatcher();

  function resetNumbers() {
    numbers = makeNumberListWith100Sum(numbersInMinigame);
  }

  // Return whether a and b sum to 100
  function numbersSumTo100(a: number, b: number): boolean {
    return a + b === 100;
  }

  function clearNumber() {
    firstSelectedNumber = null;
  }

  // Remember the pressed number
  function selectNumber(n: number) {
    if (firstSelectedNumber == null) firstSelectedNumber = n;
    else {
      const correctAnswer = numbersSumTo100(firstSelectedNumber, n);
      if (!correctAnswer) {
        message = `❌ That is the wrong answer. Try again.`;
        clearNumber();
        return;
      }

      wins += 1;
      if (wins === nRepeats) {
        dispatch(`taskComplete`);
        setTimeout(() => gotoReplace("/minigamedone"), 300);
      } else {
        resetNumbers();
        firstSelectedNumber = null;
      }
    }
  }

  let numbers = makeNumberListWith100Sum(numbersInMinigame);
  let firstSelectedNumber: number | null = null;
  let message = ``;
  let wins = 0;
</script>

<div class="flex flex-col items-center mt-10 text-base">
  <Header>Select two numbers that sum up to 100</Header>
  <p class="text-sm text-gray-300">
    Must succeed {nRepeats - wins} times in a row
  </p>
  <div class="grid grid-rows-4 grid-cols-3 w-full mt-10">
    {#each numbers as n}
      <button
        on:click={() => selectNumber(n)}
        class="border border-gray-500 p-2 m-1.5 font-semibold text-lg rounded-md transition-colors duration-200"
        class:bg-gray-400={firstSelectedNumber === n}>{n}</button
      >
    {/each}
  </div>

  <div class="mt-10">
    <button
      on:click={clearNumber}
      class="border border-gray-300 px-10 py-3 bg-transparent"
      disabled={firstSelectedNumber == null}>Clear</button
    >
  </div>

  <!-- Grid that displays how many times the player won the minigame already, and how many they have left to go-->
  <div class="mt-10 flex space-x-3">
    {#each { length: nRepeats } as _, i}
      <div
        class="border border-gray-400 w-10 h-10 text-xl flex items-baseline pt-0.5 justify-center text-green-600"
      >
        {#if wins > i}
          ✔
        {/if}
      </div>
    {/each}
  </div>

  <div class="mt-10 w-2/3">
    {message}
  </div>
</div>
