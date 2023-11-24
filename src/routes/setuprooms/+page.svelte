<script lang="ts">
    import { goto } from "$app/navigation";
    import MainButton from "$lib/MainButton.svelte";
    import { lobbyStore, playerColorStore, playerStore } from "$lib/stores";
    import { getSocketIO } from "$lib/websocket";

    let nfcs = [
        { id: 1, name: "meeting", location: "" },
        { id: 2, name: "simonsays", location: "" },
        { id: 3, name: "wiretap1", location: "" },
        { id: 4, name: "wiretap2", location: "" },
        { id: 5, name: "wiretap3", location: "" },
        { id: 6, name: "passwordcrack", location: "" },
        { id: 7, name: "bitcoinmine", location: "" },
        { id: 8, name: "killthevirus", location: "" },
        { id: 9, name: "firewallbutton1", location: "" },
        { id: 10, name: "firewallbutton2", location: "" },
    ];

    let form: HTMLFormElement;
    function setupLobby() {
        const formData = new FormData(form);
        // TODO check whether list is complete
        const formDataJson = {} as any;
        for (const [key, value] of formData.entries()) {
            formDataJson[key] = value;
        }
        console.log(JSON.stringify(formDataJson));

        const io = getSocketIO();

        io.emit("setRooms", { rooms: formDataJson });

        // goto("/lobby", { replaceState: true });form
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-around">
    <p class="text-2xl pb-5">Set Up Lobby</p>
    <p class="text-sm text-center">
        Place the NFC tags in rooms of your choosing.<br />Then write down the
        names of the rooms here.
    </p>
    <form
        class="grid grid-cols-1 justify-between items-center gap-y-1"
        bind:this={form}
    >
        <div class="flex flex-col gap-2 px-2">
            <div class="flex justify-between font-bold">
                <p>NFC</p>
                <p>Location</p>
            </div>
            {#each nfcs as nfc}
                <div class="flex justify-between gap-2">
                    <label for={"nfc" + nfc.id}>{nfc.id}: {nfc.name}</label>
                    <input
                        name={nfc.name}
                        type="text"
                        bind:value={nfc.location}
                        class="text-black px-1 w-1/2"
                    />
                </div>
            {/each}
            <!-- </div> -->
        </div>
    </form>
    <MainButton on:click={setupLobby}>Set up lobby</MainButton>
</div>
