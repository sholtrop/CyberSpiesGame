<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { browser } from '$app/environment';

    let roleContainer: HTMLElement;

    function isSpy() {
        let spy: boolean = true;
        return spy;
    }

    function showRole() {
        let role: string = "Cyber Criminal";
        if (isSpy()) {
            role = "Spy";
        }
        onMount(() => {
            roleContainer.innerText = role;
        });
    }

    function gotoGame() {
        setTimeout(() => {
            if (browser) {
                goto("/game", {replaceState: true});
            }
        }, 5000);
    }

    showRole();
    gotoGame();


</script>

<div class="flex flex-col justify-center">
    <p>Your role is: <span bind:this={roleContainer}></span></p>
    {#if isSpy()}
        <p>Your tasks are fake. Swipe up to see your special powers.</p>
    {/if}
</div>