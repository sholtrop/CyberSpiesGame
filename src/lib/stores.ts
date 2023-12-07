import { derived, writable, type Readable } from "svelte/store";
import type { Color, Lobby, Player } from "./types";

// All data of the entire lobby
export const lobbyStore = writable<Lobby | null>(null);

// Color of the current player
export const playerColorStore = writable<Color | null>(null);

// All data related to this player.
// Player store is derived from the lobbyStore by finding the
// player corresponding to our color in the lobby's `players` array
export const playerStore: Readable<Player | null> = derived(
  [lobbyStore, playerColorStore],
  ([lobby, color], set) => {
    if (lobby == null || color == null) set(null);
    else {
      const me = lobby.players[color];
      if (me == null)
        console.error(
          `Could not find own color (${color}) in the players array: ${JSON.stringify(
            lobby.players
          )}`
        );
      else set(me);
    }
  }
);

export const notificationStore: Readable<string | null> = derived(
  lobbyStore,
  (lobby) => {
    if (lobby == null) return null;
    if (
      lobby.activeEffects.firewallBreach != null &&
      lobby.status.state !== "gameEnded"
    )
      return `EMERGENCY: Firewall has been breached. Fix it in ${lobby.activities.firewallbutton1.room} and ${lobby.activities.firewallbutton2.room}. ${lobby.activeEffects.firewallBreach.countDown} seconds left.`;
    return null;
  }
);

export const showNotificationBar = writable(true);
