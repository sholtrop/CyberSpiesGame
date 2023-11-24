<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import MainButton from "$lib/MainButton.svelte";
  import type { ACTIVITIES } from "$lib/consts";
  imporNFC_ACTIVITIEStore, playerStore } from "$lib/stores";
  import type { Activities } from "$lib/types";
  import { getSocketIO }NfcActivitiesb/websocket";
  import { onMount } from "svelte";

  let nfcs: {
    id: number;NFC_ACTIVITIES
    name: (typeof ACTIVITIES)[number];
    location: string;
  }[] = [
    { id: 1, name: "meeting", location: dev ? "meetingroom" : "" },
    { id: 2, name: "simonsays", location: dev ? "room1" : "" },
    { id: 3, name: "wiretap1", location: dev ? "room2" : "" },
    { id: 4, name: "wiretap2", location: dev ? "room3" : "" },
    { id: 5, name: "wiretap3", location: dev ? "room4" : "" },
    { id: 6, name: "passwordcrack", location: dev ? "room5" : "" },
    { id: 7, name: "bitcoinmine", location: dev ? "room6" : "" },
    { id: 8, name: "killthevirus", location: dev ? "room7" : "" },
    { id: 9, name: "firewallbutton1", location: dev ? "room8" : "" },
    { id: 10, name: "firewallbutton2", location: dev ? "room9" : "" },
  ];
  let error: string | null = null;
  let form: HTMLFormElement;

  onMount(() => {
    if ($lobbyStore == null) goto("/", { replaceState: true });

    return lobbyStore.subscribe((lobby) => {
      console.log({ lobby });
      if (lobby == null) return;
      if (lobby.status.state === "inLobby") goto("/lobby");
    });
  });

  function setupLobby() {
    const formData = new FormData(form);

    const formDataJson = {} as Activities;
    let id = 1;
    for (const [key, value] of formData.entries()) {
      if (value === "" || value == null) {
        error = `Fill in all the rooms first`;
        return;
      }
      formDataJson[key] NfcActivitiesroom: value.toString(),
        id,
        name: key as any,
      };
      id += 1;
    }
    console.log(JSON.stringify(formDataJson));

    const io = getSocketIO();

    io.emit("setActivities", { activities: formDataJson });
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-around">
  <p class="text-2xl pb-5">Set Up Lobby</p>
  <p class="text-sm text-center">
    Place the NFC tags in rooms of your choosing.<br />Then write down the names
    of the rooms here.
    {#if dev}
      <span class="text-gray-500">Devmode: Rooms filled in already</span>
    {/if}
  </p>
  <p class="text-white font-bold" class:invisible={error == null}>
    {error}
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
    </div>
  </form>
  <MainButton on:click={setupLobby}>Set up lobby</MainButton>
</div>
