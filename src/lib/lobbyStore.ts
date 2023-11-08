import { writable } from "svelte/store";

type Lobby = {
  id: string;
  creatorName: string;
  players: { name: string; color: string }[];
  status: "started" | "notStarted";
};

export const lobbyStore = writable<Lobby | null>(null);
