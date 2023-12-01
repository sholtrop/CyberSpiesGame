<script lang='ts'>
    import { goto } from "$app/navigation";
    import { lobbyStore } from "$lib/stores";
    import { onMount } from "svelte";

    onMount(() => {
        const unsubscribeLobby = lobbyStore.subscribe((lobby) => {
            if (lobby != null && lobby.status.state == "meeting") {
                goto("/vote", { replaceState: true });
            }
        });
        return unsubscribeLobby;
    });
</script>

<div>
    <p>Waiting for everyone to join the meeting...</p>
</div>