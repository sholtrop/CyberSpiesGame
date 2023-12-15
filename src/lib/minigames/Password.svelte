<script lang="ts">
  import { gotoReplace } from "$lib/util";
  import { emitGameAction } from "$lib/websocket";
  import { onMount } from "svelte";
  import { TASKS } from "../../../server/consts";

  let emptyscreen = ["_", "_", "_", "_"];
  let numericalinput = [0, 0, 0, 0];
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
    false,
  ];
  let right = [false, false, false, false];
  let almost = [false, false, false, false];

  let inputhistory: number[][] = [];
  let righthistory: boolean[][] = [];
  let almosthistory: boolean[][] = [];
  let historylength = 0;

  let sequence = Array(4);
  let current = 0;
  let waiting = false;

  // onMount(() => {
  //   emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "passwordcrack")});
  // });

  function gewonnen() {
    setTimeout(() => gotoReplace("/minigamedone"), 300);
  }

  function resetGame() {
    // called at beginning of game to set parameters
    resetSequence();
    inputhistory.length = 0;
    righthistory.length = 0;
    almosthistory.length = 0;
    historylength = 0;
  }

  function resetSequence() {
    // create secret code with four unique numbers
    let num: number;
    let unique = true;
    for (var i = 0; i < sequence.length; ) {
      unique = true;
      num = Math.floor(Math.random() * 9);
      if (i > 0) {
        console.log(sequence.slice(0, i));
        for (const previous of sequence.slice(0, i)) {
          if (num == previous) {
            unique = false;
          }
        }
      }
      sequence[i] = num;
      if (unique) {
        i++;
      }
    }
    console.log(sequence);
  }

  function scroll() {
    // scroll down when new attempt is added
    // to make sure the last attempt is shown
    setTimeout(() => {
      (document.getElementById("scrollback") as HTMLElement).scrollTop = (
        document.getElementById("scrollback") as HTMLElement
      ).scrollHeight;
    }, 10);
    return;
  }

  function updateHistory() {
    inputhistory.push(numericalinput.slice());
    righthistory.push(right.slice());
    almosthistory.push(almost.slice());
    historylength += 1;
  }

  function resetInput() {
    // add current attempt to input history and reset "right" and "almost"
    updateHistory();
    waiting = false;
    for (let num = 0; num < 4; num++) {
      right[num] = false;
      almost[num] = false;
    }
    current = 0;
    if (historylength > 0) {
      scroll();
    }
  }

  function processInput() {
    // called after code is entered, fills "right" and "almost"
    current = 0;
    waiting = true;
    let success = true;
    for (let i = 0; i < 4; i++) {
      if (numericalinput[i] == sequence[i]) {
        right[i] = true;
      } else {
        success = false;
        for (let j = 0; j < 4; j++) {
          if (numericalinput[i] == sequence[j]) {
            almost[i] = true;
          }
        }
      }
    }
    if (success) {
      gewonnen();
    }
    resetInput();
  }

  function clickbutton(index: number) {
    // called when button is pressed: numerical, backspace or enter code (ok)
    if (waiting) {
      resetInput();
    }
    if (index == 10) {
      /* backspace*/
      if (current > 0) {
        current -= 1;
      }
      return;
    }
    if (index == 11) {
      /* ok*/
      if (current == 4) {
      processInput();
      }
      return;
    }

    buttonlit[index] = true;
    setTimeout(() => {
      buttonlit[index] = false;
    }, 300);

    if (current < 4) {
      numericalinput[current] = index;
      current += 1;
    }
    return;
  }

  resetGame();
</script>

<div class="body w-2/3">
  <div
    class="grid grid-cols-4 gap-4 mt-4 pb-2 mb-2 h-28 border-b border-gray-400"
    id="scrollback"
  >
    {#if historylength > 0}
      {#each Array(historylength) as _, i}
        {#each Array(4) as _, j}
          <div
            class="history h-min"
            class:history-right={righthistory[i][j]}
            class:history-almost={almosthistory[i][j]}
          >
            {inputhistory[i][j]}
          </div>
        {/each}
      {/each}
    {/if}
  </div>
  <div class="grid grid-cols-4 gap-4">
    {#each Array(4) as _, i}
      <div
        class="screen"
        class:history={waiting}
        class:screen-right={right[i]}
        class:screen-almost={almost[i]}
      >
        {i<current?numericalinput[i]:emptyscreen[i]}
      </div>
    {/each}
  </div>
  <br />
  <div class="grid grid-cols-3 grid-rows-4 gap-4 buttonpad">
    {#each Array(9) as _, i}
      <button
        class="btn"
        class:btn-light-up={buttonlit[i + 1]}
        on:click={() => clickbutton(i + 1)}>{i + 1}</button
      >
    {/each}
    <button class="btn" id="backspace" on:click={() => clickbutton(11)}
      >OK</button
    >
    <button
      class="btn"
      class:btn-light-up={buttonlit[0]}
      on:click={() => clickbutton(0)}>0</button
    >
    <button class="btn" id="backspace" on:click={() => clickbutton(10)}
      >&larr;</button
    >
  </div>
  <p class="text-gray-400">
    Guess the password.<br />You will get hints after each guessed number
  </p>
</div>

<style>
  .body {
    overflow-x: disabled;
  }
  .buttonpad {
    height: 40svh;
  }
  .btn {
    @apply font-bold py-1 px-3 rounded;
    @apply bg-slate-600;
  }
  #scrollback {
    max-height: 30svh;
    overflow-y: scroll;
    overflow-anchor: none;
  }
  .screen {
    @apply border-4;
    @apply font-bold py-1 px-3 rounded;
    @apply bg-slate-600;
    @apply border-slate-600;
  }
  .history {
    @apply border-4;
    @apply font-bold py-1 px-3 rounded text-center;
    @apply bg-slate-700;
    @apply border-slate-700;
  }
  .btn-light-up {
    @apply bg-slate-700;
  }
  .screen-right {
    @apply border-green-500;
  }
  .screen-almost {
    @apply border-yellow-500;
  }
  .history-right {
    @apply border-green-600;
  }
  .history-almost {
    @apply border-yellow-600;
  }
  #backspace {
    @apply bg-blue-950;
    @apply border-blue-950;
  }
</style>
