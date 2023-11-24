<script lang="ts">
  import { dev } from "$app/environment";
  import DevPanel from "$lib/DevPanel.svelte";
  import NotificationBar from "$lib/NotificationBar.svelte";
  import { DEV_PANEL_KEY } from "$lib/consts";
  import { lobbyStore } from "$lib/stores";
  import { getSocketIO } from "$lib/websocket";
  import "../app.postcss";

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
