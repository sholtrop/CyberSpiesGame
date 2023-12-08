<script lang="ts">

    import wiretap from "$lib/minigames/images/wiretap.png"
    import pocket from "$lib/minigames/images/wiretap_pocket.png"
    import justpocket from "$lib/minigames/images/justpocket.png"

    let windowWidth : number;
    let windowHeight : number;
    let imagewidth : number;
    let wiretapWidth : number;

    let left = 100;
    let leftdif = 0;
    let top = 100;
    let topdif = 0;
    let moving = false;
    let win = false;
    
    function gewonnen(){
        win = true;
        setTimeout(()=>alert("gewonnen"), 1000);
    }

    function setImageParams(){
        wiretapWidth = 0.2*imagewidth;
        left = (windowWidth - wiretapWidth) / 2;
        top = 0.1*imagewidth;
    }

    function checkPocket() {
        if ((left > 0.24*imagewidth) 
            && (left < 0.76*imagewidth + wiretapWidth)
            && (top > 0.5*imagewidth)
            && (top < 1.13*imagewidth + 2.3*wiretapWidth)){
                gewonnen();
            }
    }

    function onStart(event) {
        moving = true;
        leftdif = event.touches[0].clientX - left;
        topdif = event.touches[0].clientY - top;
    }
    function onMove(event){
        if (moving) {
            if (event.touches[0].clientX - leftdif < 0){
                left = 0;
            }
            else if (event.touches[0].clientX - leftdif + wiretapWidth > window.innerWidth){
                left = window.innerWidth - wiretapWidth;
            }
            else{
                left = event.touches[0].clientX - leftdif;
            }
            if (event.touches[0].clientY - topdif < 0){
                top = 0;
            }
            else if (event.touches[0].clientY - topdif + 2.3*wiretapWidth > window.innerHeight){
                top = window.innerHeight - wiretapWidth*2.3;
            }
            else{
                top = event.touches[0].clientY - topdif;
            }
        }
    }
    function onEnd(){
        moving = false
        checkPocket();
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
    <img src={pocket} alt="pocket" class="pocket" on:load={setImageParams}>
</div>

<section role="none" on:touchstart={onStart} style="left: {left}px; top: {top}px;" class="draggable">
	<img src={wiretap} alt="wiretap" style="TOP:{top};LEFT:{left}px;" width="{wiretapWidth}px">
</section>

{#if win}
<img src={justpocket} alt="pocket" class="pocket">
{/if}

</body>

