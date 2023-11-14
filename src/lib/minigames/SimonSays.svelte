<script lang="ts">
    let buttonlit = [false, false, false, false, false, false, false, false, false];
    let mistake = false;
    let blockinput = true;
    let sequence = Array(4);
    let level = 0;
    let nextclick = 0;


    function clickbutton(index: number) {
        if (blockinput) return;
        if (index == sequence[nextclick]){
            if (nextclick < level){
                nextclick += 1;
            }
            if (nextclick == level){
                if (level == sequence.length){
                    setTimeout(()=>alert("gewonnen"), 300);
                    reset();
                }
                else{
                    level += 1
                    nextclick = 0;
                    setTimeout(()=>showsequence(level), 1500);
                }
            }
        }
        else {
            mistake = true;
            level = 1;
            nextclick = 0;
            setTimeout(()=>{mistake = false; showsequence(level)}, 1500);
        }

        buttonlit[index] = true;
        setTimeout(() => {
            buttonlit[index] = false;
        }, 300);

    return
    }

    function lightupnext(index: number, total: number){
        if (index >= total){
            blockinput= false;
            return;
        }
        buttonlit[sequence[index]] = true;
        setTimeout(lightupnext, 1000, index + 1, total);
        setTimeout(()=>{buttonlit[sequence[index]] = false}, 900);

    }
    function showsequence(total: number) {
        blockinput = true;
        if (total > sequence.length) {return;}
        lightupnext(0, total), 2000;
    }
    
    function reset(){
        level = 1;
        nextclick = 0;
        blockinput = true;
        for (var i = 0; i < sequence.length; i++){
            sequence[i] = Math.floor(Math.random()*9)
        }
    }
</script>


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


<body>
    <div>
        <button on:click={()=>{
            if (level == 0){
                reset();
            }
            nextclick = 0; showsequence(level);}}>
            SHOW
        </button>
    </div>
    <div class="grid grid-cols-3 grid-rows-3 gap-4">
        {#each Array(9) as _,i}
            <button
                class="btn {buttonlit[i] && !mistake ? "btn-light-up" : ""}
                {buttonlit[i] && mistake? "btn-wrong" : ""}"
                on:click={() => clickbutton(i)}
            ></button>
        {/each}
    </div>
</body>