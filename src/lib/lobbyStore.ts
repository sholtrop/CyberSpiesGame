import { derived, writable, type Readable } from "svelte/store";

export const lobbyStore = writable<Lobby | null>(null);

// Keep track of which player we are by the color we've been assigned
export const playerColorStore = writable<Color | null>(null);

// Player store is derived from the lobbyStore by finding the
// player corresponding to our color in the lobby's `players` array
export const playerStore: Readable<Player | null> = derived(
  [lobbyStore, playerColorStore],
  ([lobby, color], set) => {
    if (!lobby || !color) set(null);
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

export type Lobby = {
  id: string;
  players: Player[];
  creator: string;
  status:
    | { state: "notStarted" }
    | { state: "roleExplanation"; countDown: number }
    | { state: "started" }
    | {
        state: "meetingCalled";
        type: "emergency" | "bodyFound";
        presentPlayers: Set<string>;
      }
    | {
        state: "meeting";
        type: "emergency" | "bodyFound";
        countDown: number;
        votes: { [name: string]: string | null };
        nVoters: number;
      }
    | { state: "voteResultAnnounced"; votedOutPlayer: string | null }
    | { state: "gameEnded"; victors: "impostors" | "crew" };
  // Between 0 and 100
  taskProgression: number;
  // Room can have a number of sabotage-fixes/tasks, but
  // there should only be one meeting point
  rooms: Room[];
  activeEffects: Effect[];
};

export type Player = {
  name: string;
  connection: "connected" | "disconnected";
  status: "alive" | "dead" | "foundDead";
  role: "crew" | "impostor" | "undecided";
  color: Color;
  tasks: number[];
};

export type Room = {
  roomName: string;
  activities: Activity[];
};

export type Activity =
  | {
      type: "task";
      taskNumber: number;
    }
  | {
      type: "sabotageFix";
    }
  | { type: "meetingPoint" };

// Effects from e.g. impostor powers
export type Effect =
  | {
      // Unable to do tasks
      effect: "hacked";
      affectedPlayers: Color[];
    }
  | {
      // Sabotage that forces one or more players to go to
      // a specific room and scan its NFC tag to fix it.
      // Failing to do so before the countDown reaches 0 results in impostor victory
      effect: "firewallBreach";
      affectedPlayers: {
        color: Color;
        destinationRoom: Room;
      };
      countDown: number;
    }
  | {
      // Sabotage that forces all affected players to stand still (checked by their mobile device)
      // If they fail, they will become affected by 'hacked'
      effect: "virusScan";
      affectedPlayers: Color[];
    }
  | {};

// Each player has one of these colors assigned to them
export type Color = "green" | "blue" | "yellow" | "white" | "red";
