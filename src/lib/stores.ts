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
      const me = lobby.players.find((player) => player.color === color);
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
