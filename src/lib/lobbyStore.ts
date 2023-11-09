import { writable } from "svelte/store";

type Lobby = {
  id: string;
  creator: string;
  players: Player[];
  status:
    | "started"
    | "notStarted"
    | "emergencyMeeting"
    | "bodyFoundMeeting"
    | "voting";
};

export const lobbyStore = writable<Lobby | null>(null);

type Player = {
  name: string;
  connection: "connected" | "disconnected";
  status: "alive" | "dead" | "foundDead";
  role: "crew" | "impostor" | "undecided";
  color: "green" | "blue" | "yellow" | "white" | "red";
};
export const playerStore = writable<Player | null>(null);
