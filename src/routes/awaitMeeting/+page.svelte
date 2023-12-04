<script lang='ts'>
    import { goto } from "$app/navigation";
    import { lobbyStore, playerStore } from "$lib/stores";
    import { onMount } from "svelte";

    onMount(() => {
        const unsubscribeLobby = lobbyStore.subscribe((lobby) => {
            if (lobby != null && lobby.status.state == "meeting") {
                if ($playerStore?.status == "alive") goto("/vote", { replaceState: true });
                else goto("/dead", { replaceState: true});
            }
        });
        return unsubscribeLobby;
    });
</script>

<div>
    <p>Waiting for everyone to join the meeting...</p>
</div>