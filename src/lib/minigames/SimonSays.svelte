<script lang="ts">
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
  let blockinput = true;
  let sequence = Array(4);
  let level = 0;
  let nextclick = 0;

  function handleClick(index: number) {
    if (blockinput) return;
    if (index === sequence[nextclick]) {
      if (nextclick < level) {
        nextclick += 1;
      }
      if (nextclick === level) {
        if (level === sequence.length) {
          setTimeout(() => alert("gewonnen"), 300);
          reset();
        } else {
          level += 1;
          nextclick = 0;
          setTimeout(() => showSequence(level), 1500);
        }
      }
    } else {
      mistake = true;
      level = 1;
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
      blockinput = false;
      return;
    }
    buttonlit[sequence[index]] = true;
    setTimeout(lightUpNext, 1000, index + 1, total);
    setTimeout(() => {
      buttonlit[sequence[index]] = false;
    }, 900);
  }
  function showSequence(total: number) {
    blockinput = true;
    if (total > sequence.length) {
      return;
    }
    lightUpNext(0, total);
  }

  function reset() {
    level = 1;
    nextclick = 0;
    blockinput = true;
    for (var i = 0; i < sequence.length; i++) {
      sequence[i] = Math.floor(Math.random() * 9);
    }
  }
</script>

<body>
  <div>
    <button
      on:click={() => {
        if (level === 0) {
          reset();
        }
        nextclick = 0;
        showSequence(level);
      }}
    >
      SHOW
    </button>
  </div>
  <div class="grid grid-cols-3 grid-rows-3 gap-4">
    {#each Array(9) as _, i}
      <button
        class="btn"
        class:btn-light-up={buttonlit[i] && !mistake}
        class:btn-wrong={buttonlit[i] && mistake}
        on:click={() => handleClick(i)}
      />
    {/each}
  </div>
</body>

<style>
  .btn {
    @apply font-bold py-4 px-4 rounded;
    @apply bg-green-500;
  }
  .btn-light-up {
    @apply bg-white;
  }
  .btn-wrong {
    @apply bg-red-600;
  }
</style>
