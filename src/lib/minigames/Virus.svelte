<script lang="ts">
    import message from "$lib/minigames/images/message.png";
    import virus from "$lib/minigames/images/virus.png";
    import { gotoReplace } from "$lib/util";
    import { emitGameAction } from "$lib/websocket";
    import { onMount } from "svelte";
    import { TASKS } from "../../../server/consts";

    let top = 500;
    let width: number;
    let height: number;
    $: lanewidth = Math.floor(width / 4);
    let start: DOMHighResTimeStamp;
    let previous: DOMHighResTimeStamp;
    let beginy: number;
    let spritewidth = 70;

    let lanes = [false, false, false, false]; // four "lanes" with items
    let messages: number[][] = []; // for each virus/message save [x, y]
    let viruses: number[][] = [];
    let messagespeeds: number[] = [];
    let virusspeeds: number[] = [];
    let totalmessages = 0; // number of messages/viruses on screen
    let totalviruses = 0;
    const pvirus = 0.3; // prbability of virus appearing
    let maxitems = 3; // max nr of items (messages + viruses) on screen
    let score = 0;
    let stopAnimation = false;

    // onMount(() => {
    //     emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "killthevirus")});
    // });

    function gewonnen() {
        stopAnimation = true;
        setTimeout(() => gotoReplace("/minigamedone"), 300);
    }
    function clickMessage() {
        if (stopAnimation) {
            return;
        }
        if (score > 0) {
            score -= 1;
        }
    }
    function clickVirus(index: number) {
        // if virus is clicked, update score and delete virus from screen
        // check if game is ended
        if (stopAnimation) {
            return;
        }
        score += 1;
        viruses[index][1] = height;
        deleteVirus(index);
        if (score >= 5) {
            gewonnen();
        }
    }

    function pickLane() {
        // Each message/virus appears at the top of the page in one of four
        // partitions of the screen, or "lane". Each lane can only contain
        // one item at a time. This function picks a random free lane
        let freelanes = 0;
        let chosenlane = 0;
        for (const lane of lanes) {
            if (lane == false) {
                freelanes += 1;
            }
        }
        if (freelanes == 0) return -1;
        chosenlane = Math.floor(Math.random() * freelanes);
        for (var i = 0; i < 4; i++) {
            if (lanes[i] == false) {
                if (chosenlane == 0) {
                    return i;
                } else {
                    chosenlane--;
                }
            }
        }
        return -1;
    }

    function pickSpeed() {
        // Pick random speed between 0.1 and 0.5
        let speed = 0.1;
        let speedvar = 0.1 * Math.floor(Math.random() * 4);
        return speed + speedvar;
    }

    function addMessage() {
        // Add message. Pick a random speed, a random lane and a random location
        // within that lane.
        let speed = pickSpeed();
        let lane = pickLane();
        if (lane < 0) return;
        lanes[lane] = true;
        let beginx = Math.max(
            0,
            lane * lanewidth +
                Math.floor(Math.random() * (lanewidth - spritewidth)),
        );
        console.log(beginx);
        messages.push([beginx, beginy]);
        messagespeeds.push(speed);
        totalmessages++;
        return;
    }

    function addVirus() {
        // Add virus. Pick a random speed, a random lane and a random location
        // within that lane.
        let speed = pickSpeed();
        let lane = pickLane();
        if (lane < 0) return;
        lanes[lane] = true;
        let beginx = Math.max(
            0,
            lane * lanewidth +
                Math.floor(Math.random() * (lanewidth - spritewidth)),
        );
        console.log(beginx);
        viruses.push([beginx, beginy]);
        virusspeeds.push(speed);
        totalviruses++;
        return;
    }

    function deleteMessage(index: number) {
        // delete message, update parameters
        let lane = Math.floor(messages[index][0] / lanewidth);
        messages.splice(index, 1);
        messagespeeds.splice(index, 1);
        lanes[lane] = false;
        if (totalmessages > 0) {
            totalmessages--;
        }
    }

    function deleteVirus(index: number) {
        // delete virus, update parameters
        let lane = Math.floor(viruses[index][0] / lanewidth);
        viruses.splice(index, 1);
        virusspeeds.splice(index, 1);
        lanes[lane] = false;
        if (totalviruses > 0) {
            totalviruses--;
        }
    }

    function newItems() {
        // if a new item can be added, this function picks what item type
        // is added and returns true. Returns false if there are no items added.
        if (totalmessages + totalviruses < maxitems) {
            let random = Math.random();
            if (random < pvirus) {
                addVirus();
            } else {
                addMessage();
            }
            return true;
        }
        return false;
    }

    function startAnimation(timeStamp: DOMHighResTimeStamp) {
        // set parameters and start animation
        start = timeStamp;
        previous = timeStamp;
        height = window.innerHeight;
        width = window.innerWidth;
        beginy = 0.2 * height;
        stopAnimation = false;
        animate(timeStamp);
    }

    function animate(timeStamp: DOMHighResTimeStamp) {
        // recursive function used for animating. For each frame the function
        // is called. The function updates the locations of the messages and
        // viruses according to the time elapsed since the last function call.
        // Delete items that are out of frame.
        // Add new item after 1 s since
        // last item was added
        if (stopAnimation) {
            return;
        }
        const elapsed = timeStamp - start;
        start = timeStamp;
        top = top + elapsed * 0.1;
        for (var i = 0; i < messages.length; i++) {
            messages[i][1] += elapsed * messagespeeds[i];
        }
        for (var i = 0; i < messages.length; i++) {
            if (messages[i][1] > height) {
                deleteMessage(i);
            }
        }
        for (var i = 0; i < viruses.length; i++) {
            viruses[i][1] += elapsed * virusspeeds[i];
        }
        for (var i = 0; i < viruses.length; i++) {
            if (viruses[i][1] > height) {
                if (score > 0) {
                    score--;
                }
                deleteVirus(i);
            }
        }

        if (timeStamp - previous > 1000) {
            if (newItems()) {
                previous = timeStamp;
            }
        }
        window.requestAnimationFrame((t) => animate(t));
    }
</script>

<body>
    Block 5 viruses
    <section class="grid grid-cols-3 gap-4">
        <button
            on:click={() => requestAnimationFrame(startAnimation)}
            class="btn"
        >
            START
        </button>
        <button
            on:click={() => {
                stopAnimation = true;
            }}
            class="btn"
        >
            PAUSE
        </button>
        <div class="btn">SCORE: {score}</div>
    </section>
    {#each messages as message_it}
        <img
            src={message}
            alt="message"
            class="message"
            style="left:{message_it[0]}px; top:{message_it[1]}px; "
            on:click={clickMessage}
            role="presentation"
        />
    {/each}

    {#each viruses as virus_it, i}
        <img
            src={virus}
            alt="virus"
            class="virus"
            style="left:{virus_it[0]}px; top:{virus_it[1]}px; "
            on:click={() => clickVirus(i)}
            role="presentation"
        />
    {/each}
</body>

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
