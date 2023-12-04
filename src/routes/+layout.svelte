<script lang="ts">
  import { dev } from "$app/environment";
  import DevPanel from "$lib/DevPanel.svelte";
  import NotificationBar from "$lib/NotificationBar.svelte";
  import { DEV_PANEL_KEY } from "$lib/consts";
  import { lobbyStore, notificationStore, playerStore } from "$lib/stores";
  import { getSocketIO } from "$lib/websocket";
  import { onMount } from "svelte";
  import "../app.postcss";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

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
      switch (lobby.status.state) {
        case "meetingCalled":
          if ($playerStore?.status !== "foundDead")
            goto("/meetingcall", { replaceState: true });
          break;

        case "gameEnded":
          goto("/gameover", { replaceState: true });
          break;

        // TODO: add case for sabotage

        default:
          console.log("Unrecognised lobby state: ", lobby.status.state);
      }
    });

    const unsubscribePlayer = playerStore.subscribe((player) => {
      let gameState = $lobbyStore?.status.state;
      if (player == null) return;
      switch (player.status) {
        case "dead":
          if (gameState !== "meetingCalled" && gameState !== "gameEnded")
            goto("/killed", { replaceState: true });
          break;

        case "foundDead":
          if (gameState !== "gameEnded") goto("/dead", { replaceState: true });

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

  // These pages dont get a notification bar
  const noNotiBarPages = ["/", "/setuprooms", "/lobby", "/role", "/join"];

  $: displayNotificationBar =
    noNotiBarPages.find((page) => $page.route.id == page) == null;
</script>

<div
  id="main-panel"
  class="min-h-screen bg-black items-center flex flex-col text-white font-mono px-2 select-none"
>
  {#if displayNotificationBar}
    <NotificationBar notificationMessage={$notificationStore}></NotificationBar>
  {/if}
  <slot class="flex-1" />
  {#if dev && showDevPanel}
    <DevPanel />
  {/if}
</div>

<svelte:window
  on:keydown={(e) => {
    if (e.ctrlKey && e.key === DEV_PANEL_KEY) showDevPanel = !showDevPanel;
  }}
/>
