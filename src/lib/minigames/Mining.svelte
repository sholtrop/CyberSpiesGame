<script lang="ts">

    import mining0 from "$lib/minigames/images/mining0.png"
    import mining1 from "$lib/minigames/images/mining1.png"
    import mining2 from "$lib/minigames/images/mining2.png"
    import mining3 from "$lib/minigames/images/mining3.png"
    import mining4 from "$lib/minigames/images/mining4.png"
    import mining5 from "$lib/minigames/images/mining5.png"
    import mining6 from "$lib/minigames/images/mining6.png"
    import mining7 from "$lib/minigames/images/mining7.png"

    let stages = [mining0, mining1, mining2, mining3, mining4, mining5, mining6, mining7];
    let currentstage = 0;
    let taps = 0;
    let inactive = false;
    let done = false;
    let waitingtime = 500;

    function gewonnen() {
        alert("gewonnen")
    }

    function processTap() {
        if (taps < currentstage){
            taps += 1;
        }
        else{
            taps = 0
            currentstage += 1;
            waitingtime += 75;
        }
        if (currentstage == 6){
            done = true;
            waitingtime = 500;
            setTimeout(() => {
                currentstage += 1;
                setTimeout(() => {
                    inactive = false;
                    gewonnen();
                }, 700);
            }, waitingtime);
        }
    }

    function onTouch(event) {
        if (inactive){
            return;
        }
        if(currentstage < 6){
            processTap();
            inactive=true;
            setTimeout(() => {
                inactive = false;
            }, waitingtime);
        }
        else {
            currentstage = 0;
            done = false;
        }
        return;
    }

</script>

<style>
    body {
        overflow-y: disabled;
        overflow-x: hidden;
    }
    .image {
        max-width: 95svw;
        max-height: 100svh;   
    }
    .inactive {
        opacity: 0.8;
    }
</style>

<svelte:window 
    on:touchstart={onTouch}
/>

<body>

<div>
    <img src={stages[currentstage]} alt="mining" class="image" class:inactive={inactive&&!done}>
</div>


</body>