import { writable } from "svelte/store";

// TODO: add the specific sabotages
type Sabotage = string;

type Lobby = {
  id: string;
  creator: string;
  players: Player[];
  status:
    | { state: "started" }
    | { state: "notStarted" }
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

  activeSabotages: Sabotage[];
};

export const lobbyStore = writable<Lobby | null>(null);

type Player = {
  name: string;
  connection: "connected" | "disconnected";
  status: "alive" | "dead" | "foundDead";
  role: "crew" | "impostor" | "undecided";
  color: "green" | "blue" | "yellow" | "white" | "red";
  tasks: number[];
};

export const playerStore = writable<Player | null>(null);

export type Task = {
  number: number;
  status: "started" | "completed";
};
