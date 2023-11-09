import { nanoid } from "nanoid";
import { MAX_PLAYERS } from "./consts.js";
import { io } from "./socketio.js";
import { Player } from "./player.js";

// Mapping of lobbyId -> lobby
const lobbies = {};

class Lobby {
  constructor({ id, players, creator, status }) {
    this.id = id;
    this.players = players;
    this.creator = creator;
    this.status = status;
  }

  // Emit the current lobby status to all players in the lobby
  synchronize() {
    io.to(this.id).emit("lobbyUpdate", { lobby: this });
  }
}

// Create lobby, return {lobby: lobby object, player: player object }
export function createLobby(creatorName) {
  const player = new Player({
    id: nanoid(),
    name: creatorName,
    status: "alive",
    connection: "connected",
    role: "undecided",
  });
  const lobbyId = nanoid();
  const lobby = new Lobby({
    id: lobbyId,
    players: [player],
    creator: creatorName,
    status: "notStarted",
  });
  lobbies[lobbyId] = lobby;
  return { lobby, player };
}

// Join an existing lobby, return [false, `error string`] or [true, {lobby: lobby object, player: player object}]
export function joinLobby(lobbyId, playerName) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return [false, `Lobby with id ${lobbyId} does not exist`];

  const players = lobby.players;
  if (players.length === MAX_PLAYERS)
    return [false, `Maximum amount of players reached`];

  if (players.find(({ name }) => playerName === name))
    return [false, `Name ${playerName} is already taken`];

  // Give player a random, non-used color
  let color = randomPlayerColor();
  while (players.find(({ usedColor }) => usedColor === color) != null) {
    color = randomPlayerColor();
  }
  const player = {
    name: playerName,
    color,
    status: "connected",
  };
  players.push({
    name: playerName,
    color,
  });
  return [true, { lobby, player }];
}

// Remove player from an existing lobby. Also remove the lobby if this was the last player left.
// If player does not exist in this lobby, returns `null` if there is no lobby (anymore), else returns the lobby.
export function removePlayer(lobbyId, playerName) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return null;
  const playerIdx = lobby.players.findIndex(({ name }) => name === playerName);
  console.debug(`Player ${playerName} left lobby ${lobbyId}`);
  // Remove lobby entirely if no players are left
  if (lobby.players.length === 0) {
    delete lobbies[lobbyId];
    console.debug(`Remove lobby ${lobbyId} because it has no players left`);
    return null;
  }
  // Remove the player from the list of players
  lobby.players.splice(playerIdx, 1); // Delete player from array of players
  return lobby;
}

export function getLobby(lobbyId) {
  return lobbies[lobbyId];
}

export function killPlayer(lobbyId, playerColor) {
  const players = lobbies[lobbyId];
  if (!players) return [false, `Lobby with id ${lobbyId} does not exist`];
  players.find((player) => player.color === playerColor);
}
