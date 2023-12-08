<script lang="ts">
    import mining0 from "$lib/minigames/images/mining0.png";
    import mining1 from "$lib/minigames/images/mining1.png";
    import mining2 from "$lib/minigames/images/mining2.png";
    import mining3 from "$lib/minigames/images/mining3.png";
    import mining4 from "$lib/minigames/images/mining4.png";
    import mining5 from "$lib/minigames/images/mining5.png";
    import mining6 from "$lib/minigames/images/mining6.png";
    import mining7 from "$lib/minigames/images/mining7.png";
    import { gotoReplace } from "$lib/util";
    import { emitGameAction } from "$lib/websocket";
    import { onMount } from "svelte";
    import { TASKS } from "../../../server/consts";

    let stagesUp = [mining0, mining3, mining5, mining7];
    let stagesDown = [mining1, mining2, mining4, mining6];
    let currentstage = 0;
    let taps = 0;
    let inactive = false;
    let hammerdown = false;
    let done = false;
    let waitingtime = 500;

    // onMount(() => {
    //     emitGameAction({action: "startTask", taskNumber: TASKS.findIndex(({name}) => name === "bitcoinmine")});
    // });

    function gewonnen() {
        setTimeout(() => gotoReplace("/minigamedone"), 300);
    }

    function processTap() {
        if (taps < currentstage + 1) {
            taps += 1;
        } else {
            taps = 0;
            currentstage += 1;
            waitingtime += 75;
        }
        if (currentstage == 3) {
            done = true;
            waitingtime = 500;
            setTimeout(() => {
                setTimeout(() => {
                    inactive = false;
                    gewonnen();
                }, 700);
            }, waitingtime);
        }
    }

    function onTouch(event) {
        if (inactive) {
            return;
        }
        if (currentstage < 3) {
            processTap();
            inactive = true;
            hammerdown = true;
            setTimeout(() => {
                hammerdown = false;
            }, 200);
            setTimeout(() => {
                inactive = false;
            }, waitingtime);
        } else {
            currentstage = 0;
            done = false;
        }
        return;
    }
</script>

<svelte:window on:touchstart={onTouch} />

<body>
    <div>
        <img
            src={hammerdown ? stagesDown[currentstage] : stagesUp[currentstage]}
            alt="mining"
            class="image"
            class:inactive={inactive && !done}
        />
    </div>
</body>

<style>
    body {
        overflow-y: disabled;
        overflow-x: hidden;
    }
    .image {
        max-width: 95svw;
        max-height: 100svh;
        user-select: none;
    }
    .inactive {
        opacity: 1;
    }
</style>
