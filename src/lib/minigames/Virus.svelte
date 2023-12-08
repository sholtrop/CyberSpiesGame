<script lang="ts">
    import message from "$lib/minigames/images/message.png";
    import virus from "$lib/minigames/images/virus.png"
    import { gotoReplace } from "$lib/util";
    import { emitGameAction } from "$lib/websocket";
    import { onMount } from "svelte";
    import { TASKS } from "../../../server/consts";

    let top = 500;
    let left = 1000;
    let width : number;
    let height : number;
    $: lanewidth = Math.floor(width/4);
    let start : DOMHighResTimeStamp;
    let previous : DOMHighResTimeStamp;
    let beginy : number;
    let spritewidth = 70;

    let lanes = [false, false, false, false]; /* four lanes with items */
    let messages : number[][] = [];
    let viruses : number[][] = []; // for each virus/message save [x, y]
    let messagespeeds : number[] = [];
    let virusspeeds : number[] = [];
    let totalmessages = 0;
    let totalviruses = 0;
    const pvirus = 0.3;
    let uselanes = 3;
    let score = 0;
    let winscore = 5;
    let stopAnimation = false;

    onMount(() => {
        emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "killthevirus")});
    });

    function gewonnen(){
        stopAnimation = true;
        setTimeout(()=>gotoReplace("/minigamedone"), 300);
    }
    function clickMessage(){
        if (stopAnimation) {
            return;
        }
        if (score > 0){
            score -= 1;
        }
    }
    function clickVirus(index : number){
        if (stopAnimation) {
            return;
        }
        score += 1;
        viruses[index][1] = height;
        deleteVirus(index);
        if (score >= 5){
            gewonnen();
        }
    }
    
    function pickLane(){
        let freelanes = 0;
        let chosenlane = 0;
        for (const lane of lanes){
            if (lane == false){
                freelanes += 1;
            }
        }
        if (freelanes == 0) return -1;
        chosenlane = Math.floor(Math.random()*freelanes);
        for (var i = 0; i < 4; i++){
            if (lanes[i] == false){
                if (chosenlane == 0)
                    {return i;}
                else{
                    chosenlane --;
                }
            }
        }
        return -1;

    }

    function pickSpeed() {
        // speed between 0.1 and 0.5
        let speed = 0.1;
        let speedvar = 0.1 * Math.floor(Math.random()*4);
        return speed + speedvar;
    }

    function addMessage(){
        let speed = pickSpeed();
        let lane = pickLane();
        if (lane < 0) return;
        lanes[lane] = true;
        let beginx = Math.max(0,lane*lanewidth + Math.floor(Math.random()*(lanewidth - spritewidth)));
        console.log(beginx);
        messages.push([beginx,beginy]);
        messagespeeds.push(speed);
        totalmessages ++;
        return;
    }

    function addVirus(){
        let speed = pickSpeed();
        let lane = pickLane();
        if (lane < 0) return;
        lanes[lane] = true;
        let beginx = Math.max(0,lane*lanewidth + Math.floor(Math.random()*(lanewidth - spritewidth)));
        console.log(beginx);
        viruses.push([beginx,beginy]);
        virusspeeds.push(speed);
        totalviruses ++;
        return;
    }

    function deleteMessage(index : number){
        let lane = Math.floor(messages[index][0]/lanewidth)
        messages.splice(index, 1);
        messagespeeds.splice(index,1);
        lanes[lane] = false;
        if (totalmessages > 0){
        totalmessages--;}
    }

    function deleteVirus(index : number){
        let lane = Math.floor(viruses[index][0]/lanewidth)
        viruses.splice(index, 1);
        virusspeeds.splice(index,1);
        lanes[lane] = false;
        if(totalviruses > 0){
        totalviruses--;}
    }
    
    function newItems(){
        if (totalmessages + totalviruses <= uselanes){
            let random = Math.random();
            if (random < pvirus){
                addVirus();
            }
            else{
                addMessage();
            }
            return true;
        }
        return false;
    }
    

    function startAnimation(timeStamp: DOMHighResTimeStamp){
        start = timeStamp;
        previous = timeStamp;
        height = window.innerHeight;
        width = window.innerWidth;
        beginy = 0.2*height;
        stopAnimation = false;
        animate(timeStamp);
    }

    function animate(timeStamp : DOMHighResTimeStamp){
        if (stopAnimation){ return;}
        const elapsed = timeStamp - start;
        start = timeStamp;
        top = top + (elapsed*0.1);
        for (var i = 0; i < messages.length; i++){
            messages[i][1] += elapsed * messagespeeds[i];
        }
        for (var i = 0; i < messages.length; i++){
            if (messages[i][1] > height){
                deleteMessage(i);
            }
        }
        for (var i = 0; i < viruses.length; i++){
            viruses[i][1] += elapsed * virusspeeds[i];

        }
        for (var i = 0; i < viruses.length; i++){
            if (viruses[i][1] > height){
                if(score > 0){
                    score --;
                }
                deleteVirus(i);
            }
        }

        if (timeStamp - previous > 1000){
            if(newItems()){
                previous = timeStamp;
            }
        }
        window.requestAnimationFrame((t)=>animate(t));
    }

</script>

<style>
    .message {
        image-rendering: pixelated;
        width: 70px;
        height: auto;
        position: absolute;
        
    }
    .virus {
        image-rendering: pixelated;
        width: 70px;
        height: auto;
        position: absolute;
    }
    .btn {
        @apply font-bold py-4 px-4 rounded;
        @apply bg-slate-600;
    }
</style>

<body>
    Block 5 viruses
    <section class="grid grid-cols-3 gap-4">
    <button on:click={()=>requestAnimationFrame(startAnimation)} class="btn">
        START
    </button>
    <button on:click={()=>{stopAnimation = true;}} class="btn">
        PAUSE
    </button>
    <div class="btn">SCORE: {score}</div>
    </section>
    {#each messages as message_it}
        <img src={message} alt="message" class="message" style="left:{message_it[0]}px; top:{message_it[1]}px; " on:click={clickMessage} role="presentation">
    {/each}

    {#each viruses as virus_it, i}
        <img src={virus} alt="virus" class="virus" style="left:{virus_it[0]}px; top:{virus_it[1]}px; " on:click={()=>clickVirus(i)} role="presentation">
    {/each}
    
</body>