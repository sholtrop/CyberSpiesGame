<script lang="ts">
  import { dev } from "$app/environment";
  import DevPanel from "$lib/DevPanel.svelte";
  import NotificationBar from "$lib/NotificationBar.svelte";
  import { DEV_PANEL_KEY } from "$lib/consts";
  import {
    lobbyStore,
    notificationStore,
    playerColorStore,
    playerStore,
  } from "$lib/stores";
  import { getSocketIO } from "$lib/websocket";
  import { onMount } from "svelte";
  import "../app.postcss";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import type { Color } from "$lib/types";
  import { gotoReplace } from "$lib/util";

  let showDevPanel = false;
  const socket = getSocketIO();

  // Use the current lobbyState to determine which page the player should navigate to after reconnecting
  function navigateAfterReconnect() {
    if ($lobbyStore == null) {
      gotoReplace("/");
      return;
    }

    switch ($lobbyStore.status.state) {
      case "meetingCalled":
        if ($playerStore?.status !== "foundDead") gotoReplace("/meetingcall");
        break;
      case "inLobby":
        gotoReplace("/lobby");
        break;
      case "meeting":
        if ($playerStore?.status === "alive") gotoReplace("/vote");
        break;
      case "roleExplanation":
        gotoReplace("/role");
        break;
      case "settingRooms":
        gotoReplace("/setuprooms");
        break;
      case "started":
        gotoReplace("/game");
        break;
      case "voteResultAnnounced":
        gotoReplace("/voteover");
        break;
      case "gameEnded":
        gotoReplace("/gameover");
        break;
      default:
        // Unreachable: Every case must be handled
        $lobbyStore.status satisfies never;
    }
  }

  function tryReconnect() {
    const storedGameInfo = localStorage.getItem("gameInfo");
    let gameInfo: { playerId: string; lobbyId: string; color: Color } | null =
      null;
    if (storedGameInfo != null) {
      gameInfo = JSON.parse(storedGameInfo);
    }
    if (gameInfo) {
      socket.once("reconnected", ({ success, lobby, color }) => {
        if (success) {
          playerColorStore.set(color);
          lobbyStore.set(lobby);
          navigateAfterReconnect();
        } else {
          console.debug("Lobby does not exist anymore, redirect to start page");
          localStorage.removeItem("gameInfo");
          gotoReplace("/");
        }
      });
      socket.emit("reconnect", {
        color: gameInfo.color,
        playerId: gameInfo.playerId,
        lobbyId: gameInfo.lobbyId,
      });
    }
  }

  onMount(() => {
    // The 'lobbyUpdate' event sends the entire state of the lobby to all players
    socket.on("lobbyUpdate", ({ lobby }) => {
      console.log("Lobby was updated", { lobby });
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

    socket.on("cooldownUpdate", ({ cooldowns }) => {
      console.log("cd update");
      lobbyStore.update((lobby) => {
        if (lobby != null) {
          for (const [color, cds] of Object.entries(cooldowns)) {
            const player = lobby.players[color as Color];
            const cooldown = cds as any;
            if (player.role.name === "impostor") {
              player.role.killCooldown = cooldown.killCooldown;
              player.role.sabotageCooldown = cooldown.sabotageCooldown;
            }
          }
        }
        return lobby;
      });
    });

    const unsubscribeLobby = lobbyStore.subscribe((lobby) => {
      if (lobby == null) return;
      switch (lobby.status.state) {
        case "meetingCalled":
          if ($playerStore?.status !== "foundDead") gotoReplace("/meetingcall");
          break;

        case "gameEnded":
          gotoReplace("/gameover");
          break;

        // TODO: add case for sabotage
      }
    });

    const unsubscribePlayer = playerStore.subscribe((player) => {
      let gameState = $lobbyStore?.status.state;
      if (player == null) return;
      switch (player.status) {
        case "dead":
          if (gameState !== "meetingCalled" && gameState !== "gameEnded")
            gotoReplace("/killed");
          break;

        case "foundDead":
          if (gameState !== "gameEnded") gotoReplace("/dead");
      }
    });

    function unsubscribe() {
      unsubscribeLobby();
      unsubscribePlayer();
    }
    if ($page.route.id !== "/join" && $page.route.id !== "/") tryReconnect();
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
