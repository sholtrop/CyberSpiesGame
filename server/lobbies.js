import { nanoid } from "nanoid";
import { MAX_PLAYERS } from "./consts.js";

// Mapping of lobbyId -> lobby
const lobbies = {};

// Create lobby, return the lobby object
export function createLobby(creatorName) {
  const id = nanoid();

  lobbies[id] = {
    id,
    players: [{ name: creatorName, color: randomPlayerColor() }],
    creator: creatorName,
    status: "notStarted",
  };
  return lobbies[id];
}

// Join an existing lobby, return [false `error string`] or [true, lobby object]
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
  players.push({
    name: playerName,
    color,
  });
  return [true, lobby];
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

const colors = ["green", "blue", "yellow", "white", "red"];

function randomPlayerColor() {
  const randInt = Math.floor(Math.random() * colors.length);
  return colors[randInt];
}
