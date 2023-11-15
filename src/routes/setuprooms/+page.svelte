<script lang="ts">
    import { goto } from "$app/navigation";
    import { lobbyStore, playerColorStore, playerStore } from "$lib/lobbyStore";

    let nfcs = [
        {id: 1, name: "meeting", location: ""},
        {id: 2, name: "simonsays", location: ""},
        {id: 3, name: "wiretap1", location: ""},
        {id: 4, name: "wiretap2", location: ""},
        {id: 5, name: "wiretap3", location: ""},
        {id: 6, name: "passwordcrack", location: ""},
        {id: 7, name: "bitcoinmine", location: ""},
        {id: 8, name: "killthevirus", location: ""},
        {id: 9, name: "firewallbutton1", location: ""},
        {id: 10, name: "firewallbutton2", location: ""}
    ];

    function submitForm() {
        console.log(nfcs);
        goto("/lobby", { replaceState: true });
    }
</script>

<div class="h-full flex flex-col items-center">
    <p class="text-2xl pb-5">Set Up Lobby</p>
    <form on:submit={submitForm} class="flex flex-col justify-between items-center h-full">
        <div class="flex flex-col gap-2 px-2">
            <div class="flex justify-between">
                <p>NFC</p>
                <p>Location</p>
            </div>
            {#each nfcs as nfc}            
                <div class="flex justify-between gap-2">
                    <label for={"nfc" + nfc.id}>{nfc.id}: {nfc.name}</label>
                    <input type="text" bind:value={nfc.location} class="text-black px-1 w-1/3">
                </div>
            {/each}
        </div>
        <div>
            <input type="submit" value="Set Up Lobby" class="border px-6 py-4 text-lg border-green-600 disabled:text-gray-400 min-w-[12rem]">
        </div>
    </form>

</div>