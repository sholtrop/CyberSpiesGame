<script lang="ts">
    import wiretap from "$lib/minigames/images/wiretap.png";
    import pocket from "$lib/minigames/images/wiretap_pocket.png";
    import justpocket from "$lib/minigames/images/justpocket.png";
    import { gotoReplace } from "$lib/util";
    import { onMount } from "svelte";
    import { emitGameAction } from "$lib/websocket";
    import { TASKS } from "../../../server/consts";

    let windowWidth: number;
    let windowHeight: number;
    let imagewidth: number;
    let wiretapWidth: number;

    let left = 100;
    let leftdif = 0;
    let top = 100;
    let topdif = 0;
    let moving = false;
    let win = false;
    let showWiretap = false;

    // onMount(() => {
    //     emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "wiretap")});
    // });

    function gamecomplete() {
        win = true;
        setTimeout(() => gotoReplace("/minigamedone"), 300);
    }

    function setImageParams() {
        // set image parameters according to screen size
        wiretapWidth = 0.2 * imagewidth;
        left = (windowWidth - wiretapWidth) / 2;
        top = 0.1 * imagewidth;
        showWiretap = true;
    }

    function checkPocket() {
        // check if wiretap is in pocket
        if (
            left > 0.24 * imagewidth &&
            left < 0.76 * imagewidth + wiretapWidth &&
            top > 0.5 * imagewidth &&
            top < 1.13 * imagewidth + 2.3 * wiretapWidth
        ) {
            gamecomplete();
        }
    }

    function onStart(event) {
        // called when wiretap is touched at beginning of touch event
        moving = true;
        leftdif = event.touches[0].clientX - left;
        topdif = event.touches[0].clientY - top;
    }
    function onMove(event) {
        // update location of wiretap during touch/drag
        if (moving) {
            if (event.touches[0].clientX - leftdif < 0) {
                left = 0;
            } else if (
                event.touches[0].clientX - leftdif + wiretapWidth >
                window.innerWidth
            ) {
                left = window.innerWidth - wiretapWidth;
            } else {
                left = event.touches[0].clientX - leftdif;
            }
            if (event.touches[0].clientY - topdif < 0) {
                top = 0;
            } else if (
                event.touches[0].clientY - topdif + 2.3 * wiretapWidth >
                window.innerHeight
            ) {
                top = window.innerHeight - wiretapWidth * 2.3;
            } else {
                top = event.touches[0].clientY - topdif;
            }
        }
    }
    function onEnd() {
        // called at end of touch event
        moving = false;
        checkPocket();
    }
</script>

<svelte:window
    bind:innerWidth={windowWidth}
    bind:innerHeight={windowHeight}
    on:touchend={onEnd}
    on:touchmove={onMove}
/>

<body>
    <div bind:clientWidth={imagewidth}>
        <img
            src={pocket}
            alt="pocket"
            class="pocket"
            on:load={setImageParams}
        />
    </div>

    {#if showWiretap}
    <section
        role="none"
        on:touchstart={onStart}
        style="left: {left}px; top: {top}px;"
        class="draggable"
    >
        <img
            src={wiretap}
            alt="wiretap"
            style="TOP:{top};LEFT:{left}px;"
            width="{wiretapWidth}px"
        />
    </section>
    {/if}
</body>

<style>
    body {
        overflow-y: disabled;
        overflow-x: hidden;
    }
    .draggable {
        user-select: none;
        position: absolute;
    }
    .pocket {
        max-width: 95svw;
        max-height: 100svh;
    }
</style>
