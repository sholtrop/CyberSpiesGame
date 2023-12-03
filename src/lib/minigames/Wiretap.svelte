<script lang="ts">

    import wiretap from "$lib/minigames/images/wiretap.png"
    import pocket from "$lib/minigames/images/wiretap_pocket.png"

    let windowWidth : number;
    let windowHeight : number;
    let imagewidth : number
    let wiretapWidth : number;

    let left = 100;
    let leftdif = 0;
    let top = 100;
    let topdif = 0;
    let moving = false;
    
    function setImageParams(){
        left = windowWidth / 2;
        top = windowWidth;
        wiretapWidth = 0.2*imagewidth;
    }

    function onStart(event) {
        moving = true;
        leftdif = event.touches[0].clientX - left;
        topdif = event.touches[0].clientY - top;
    }
    function onMove(event){
        if (moving) {
            left = event.touches[0].clientX - leftdif;
            top = event.touches[0].clientY - topdif;
        }
    }
    function onEnd(){
        moving = false
    }
</script>

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

<svelte:window 
    bind:innerWidth={windowWidth} 
    bind:innerHeight={windowHeight} 
    on:touchend={onEnd} on:touchmove={onMove} 
/>

<body>

<div bind:clientWidth={imagewidth}>
    <img src={pocket} alt="pocket" class="pocket"/>
</div>

<section role="none" on:touchstart={onStart} style="left: {left}px; top: {top}px;" class="draggable">
	<img src={wiretap} alt="wiretap" style="TOP:{top};LEFT:{left}px;" width="{wiretapWidth}px"
    on:load={setImageParams}>
</section>

</body>

