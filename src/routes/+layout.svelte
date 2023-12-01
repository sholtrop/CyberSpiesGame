<script lang="ts">
  import { dev } from "$app/environment";
  import DevPanel from "$lib/DevPanel.svelte";
  import NotificationBar from "$lib/NotificationBar.svelte";
  import { DEV_PANEL_KEY } from "$lib/consts";
  import { lobbyStore, playerStore } from "$lib/stores";
  import { getSocketIO } from "$lib/websocket";
  import { onMount } from "svelte";
  import "../app.postcss";
    import { goto } from "$app/navigation";

  let showDevPanel = false;
  let showNotification = false;
  let notificationMessage: string;

  function addNotification() {
    let msg = "Warning: Firewall breached!";
    notificationMessage = msg;
    showNotification = true;
  }

  function rmNotification() {
    showNotification = false;
  }

  const socket = getSocketIO();

  // The 'lobbyUpdate' event sends the entire state of the lobby to all players
  socket.on("lobbyUpdate", ({ lobby }) => {
    lobbyStore.set(lobby);
  });

  // The 'countDown' event sends only the current countDown (if there is any),
  // making it a more light-weight update
  socket.on("countDown", ({ count }) => {
    lobbyStore.update((lobby) => {
      if (lobby != null && "countDown" in lobby.status) {
        lobby.status.countDown = count;
        return lobby;
      }
      return null;
    });
  });

  onMount(() => {
    const unsubscribeLobby = lobbyStore.subscribe((lobby) => {
      if (lobby == null) return;
      switch(lobby.status.state) {
        case 'meetingCalled':
          console.log("in meetingCalled");
          if ($playerStore?.status != 'foundDead') goto("/meetingcall", { replaceState: true });
          break;
        
        case 'gameEnded':
          goto("/gameover", { replaceState: true });
          break;

        // TODO: add case for sabotage

        default:
          console.log("Unrecognised lobby state: ", lobby.status.state);
      }
    });

    const unsubscribePlayer = playerStore.subscribe((player) => {
      if (player == null) return;
      switch(player.status) {
        case 'dead':
          goto("/killed", { replaceState: true });
          break;

        case 'foundDead':
          goto("/dead", { replaceState: true });

        default:
          console.log("Unknown player status: ", player.status);
      }
    });

    function unsubscribe() {
      unsubscribeLobby(); 
      unsubscribePlayer();
    }
    return unsubscribe;
  });

</script>

<div
  class="bg-black min-h-screen flex flex-col items-center text-white font-mono px-2 select-none"
>
  <slot />
</div>

{#if showNotification}
  <NotificationBar {notificationMessage}></NotificationBar>
{/if}

<svelte:window
  on:keydown={(e) => {
    if (e.ctrlKey && e.key === DEV_PANEL_KEY) showDevPanel = !showDevPanel;
  }}
/>
{#if dev && showDevPanel}
  <DevPanel />
{/if}
