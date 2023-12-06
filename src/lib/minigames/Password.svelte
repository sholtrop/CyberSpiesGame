<script lang="ts">
    let input = ["_", "_", "_", "_"];
    let numericalinput = [0, 0, 0, 0];
    let buttonlit = [false, false, false, false, false, false, false, false, false, false];
    let right = [false, false, false, false];
    let almost = [false, false, false, false];

    let inputhistory: number[][] = [];
    let righthistory : boolean[][] = [];
    let almosthistory : boolean[][] = [];
    let historylength = 0;

    let sequence = Array(4);
    let current = 0;
    let waiting = false;

    
    function gewonnen(){
        alert("gewonnen")
        setTimeout(()=>{
            resetGame();
            resetInput();
        }, 1000);
    }

    function resetGame(){
        resetSequence();
        inputhistory.length = 0;
        righthistory.length = 0;
        almosthistory.length = 0;
        historylength = 0;
    }

    function resetSequence(){
        let num : number;
        let unique = true;
        for (var i = 0; i < sequence.length;){
            unique = true;
            num = Math.floor(Math.random()*9);
            if (i > 0){
                console.log(sequence.slice(0,i));
                for (const previous of sequence.slice(0,i)){
                    if (num == previous){unique = false;}
                }
            }
            sequence[i] = num;
            if (unique){i++;}
        }
        console.log(sequence);
    }

    function scroll() {
        setTimeout(()=>{
        (document.getElementById('scrollback') as HTMLElement).scrollTop = 
        (document.getElementById('scrollback') as HTMLElement).scrollHeight;
        },10)
        return;
    }

    function updateHistory(){
        inputhistory.push(numericalinput.slice());
        righthistory.push(right.slice());
        almosthistory.push(almost.slice());
        historylength += 1;
    }

    function resetInput(){
        updateHistory();
        waiting = false;
        input = ["_", "_", "_", "_"];
        for (let num = 0; num < 4; num++){
            right[num] = false;
            almost[num] = false;
        }
        current = 0;
        if (historylength > 0){
        scroll();
        }
    }

    function processInput(){
        current=0;
        waiting = true;
        let success = true;
        for (let i = 0; i < 4; i++){
            if (numericalinput[i] == sequence[i]){
                right[i] = true;
            }
            else {
                success = false;
                for (let j = 0; j < 4; j++){
                    if (numericalinput[i] == sequence[j]){
                        almost[i] = true;
                    }
                }
            }
        }
        if (success){
            gewonnen();
        }
    }

    function clickbutton(index: number) {
        if (waiting){
            resetInput();
        }
        if (index == 10){ /* backspace*/
            if (current > 0){
                current -= 1;
                input[current] = "_";
            }
            return;
        }
        if (index == 11){ /* backspace*/
            while (current > 0){
                current -= 1;
                input[current] = "_";
            }
            return;
        }

        buttonlit[index] = true;
        setTimeout(()=>{
            buttonlit[index] = false;
        }, 300)
        
        if (current < 4){
            input[current] = String(index);
            numericalinput[current] = index;
            current += 1;
        }
        if (current==4){
            setTimeout(()=>processInput(), 100);
        }
        return;
    }

    resetGame();
</script>


<style>
    body {
        overflow-x: disabled;
    }
    .buttonpad {
        height: 40svh;
    }
    .btn {
        @apply font-bold py-4 px-4 rounded;
        @apply bg-slate-600;
    }
    #scrollback{
        max-height: 30svh;
        overflow-y: scroll;
        overflow-anchor: none;
    }
    .screen {
        @apply border-4;
        @apply font-bold py-4 px-4 rounded;
        @apply bg-slate-600;
        @apply border-slate-600;
    }
    .history {
        @apply border-4;
        @apply font-bold py-4 px-4 rounded;
        @apply bg-slate-700;
        @apply border-slate-700;
    }
    .btn-light-up {
        @apply bg-slate-700;
    }
    .screen-right{
        @apply border-green-500;
    }
    .screen-almost {
        @apply border-yellow-500;
    }
    .history-right{
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

<body>
    <div class="grid grid-cols-4 gap-4" id="scrollback">
        
        {#if historylength > 0}
        {#each Array(historylength) as _,i}
            {#each Array(4) as _,j}
                <div  
                    class="history" 
                    class:history-right={righthistory[i][j]} 
                    class:history-almost={almosthistory[i][j]}>
                        {inputhistory[i][j]}
                </div>
            {/each}
        {/each}
        {/if}
    </div>
    {#if historylength > 0}
        <br>
    {/if}
    <div class="grid grid-cols-4 gap-4">
        {#each Array(4) as _,i}
            <div  
                class="screen" 
                class:screen-right={right[i]} 
                class:screen-almost={almost[i]}>
                    {input[i]}
            </div>
        {/each}
    </div>
    <br>
    <div class="grid grid-cols-3 grid-rows-4 gap-4 buttonpad">
        {#each Array(9) as _,i}
            <button
                class="btn" 
                class:btn-light-up={buttonlit[i+1]}
                on:click={() => clickbutton(i+1)}
            >{i+1}</button>
        {/each}
        <button class="btn" id="backspace"
        on:click={() => clickbutton(11)}>CA</button>
        <button class="btn" class:btn-light-up={buttonlit[0]}
        on:click={() => clickbutton(0)}>0</button>
        <button class="btn" id="backspace"
        on:click={() => clickbutton(10)}>&larr;</button>
    </div>
    <br>
</body>