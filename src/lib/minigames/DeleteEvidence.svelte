<script lang="ts">
    import file from "$lib/minigames/images/file.png";
    import trash from "$lib/minigames/images/trash.png";
    import { gotoReplace } from "$lib/util";
    import { emitGameAction } from "$lib/websocket";
    import { onMount } from "svelte";
    import { TASKS } from "../../../server/consts";
    let width: number;
    let height: number;
    let spritewidth = 100;
    let files: number[][] = []; // x and y locations of each file icon
    let showfile = [true, true, true, true, true, true, true, true, true];
    let filesleft = 9;
    let trashbin: number[] = []; // x and y location of trash icon
    let moving = false;
    let currentmove: number; // index of icon being moved (if moving == true)
    let leftdif = 0;
    let topdif = 0;

    // onMount(() => {
    //     emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "destroyevidence")});
    // });

    function gewonnen() {
        setTimeout(() => gotoReplace("/minigamedone"), 300);
    }

    function initializeParameters() {
        // spacing is determined on the screen height and width
        width = window.innerWidth;
        height = window.innerHeight;
        let usablex = 0.8 * width - spritewidth;
        let offsetx = 0.1 * width;
        let usabley = 0.7 * height - spritewidth;
        let offsety = 0.2 * height;
        let x: number;
        let y: number;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                x = Math.floor((i * usablex) / 2 + offsetx);
                y = Math.floor((j * usabley) / 3 + offsety);
                files.push([x, y].slice());
                console.log([x, y]);
            }
        }
        trashbin = [
            Math.floor((2 * usablex) / 2 + offsetx),
            Math.floor((3 * usabley) / 3 + offsety),
        ];
        files = files.slice();
    }

    function onStart(event, index) {
        // called at beginning of touch event,
        moving = true;
        leftdif = event.touches[0].clientX - files[index][0];
        topdif = event.touches[0].clientY - files[index][1];
        currentmove = index;
    }

    function onMove(event) {
        // update location of dragged icon
        if (moving) {
            if (event.touches[0].clientX - leftdif < 0) {
                files[currentmove][0] = 0;
            } else if (
                event.touches[0].clientX - leftdif + spritewidth >
                window.innerWidth
            ) {
                files[currentmove][0] = window.innerWidth - spritewidth;
            } else {
                files[currentmove][0] = event.touches[0].clientX - leftdif;
            }
            if (event.touches[0].clientY - topdif < 0) {
                files[currentmove][1] = 0;
            } else if (
                event.touches[0].clientY - topdif + spritewidth >
                window.innerHeight
            ) {
                files[currentmove][1] = window.innerHeight - spritewidth;
            } else {
                files[currentmove][1] = event.touches[0].clientY - topdif;
            }
        }
    }

    function onEnd() {
        // called when touch event is stopped
        moving = false;
        checkBin();
    }

    function checkBin() {
        // check if item was dragged into trash bin
        if (
            files[currentmove][0] + 80 > trashbin[0] &&
            files[currentmove][0] - 80 < trashbin[0] &&
            files[currentmove][1] + 80 > trashbin[1] &&
            files[currentmove][1] - 80 < trashbin[1]
        ) {
            showfile[currentmove] = false;
            files[currentmove][0] = 0;
            files[currentmove][1] = 0;
            filesleft--;
            console.log(filesleft);
        }

        if (filesleft <= 0) {
            gewonnen();
        }
        return;
    }
</script>

<svelte:window on:touchend={onEnd} on:touchmove={onMove} />

<body on:load={initializeParameters()}>
    <section>
        <img
            src={trash}
            alt="trashbin"
            class="picture"
            style="left:{trashbin[0]}px; top:{trashbin[1]}px;"
        />
        {#each files as file_it, i}
            {#if showfile[i]}
                <img
                    src={file}
                    alt="file"
                    class="picture"
                    style="left:{file_it[0]}px; top:{file_it[1]}px;"
                    on:touchstart={(event) => onStart(event, i)}
                />
            {/if}
        {/each}
    </section>
</body>

<style>
    body {
        overflow-y: disabled;
        overflow-x: hidden;
    }
    .picture {
        position: absolute;
        user-select: none;
        image-rendering: pixelated;
        width: 100px;
        height: auto;
    }
</style>
