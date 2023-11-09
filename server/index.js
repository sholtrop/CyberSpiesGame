import { io } from "./socketio.js";
import { createLobby, getLobby, joinLobby, removePlayer } from "./lobbies.js";
import { nfcAction } from "./nfc.js";

function playerNameValid(name) {
  if (name.length < 3)
    return [false, `Name ${name} is too short. Minimum of 3 characters`];
  if (name.length > 16)
    return [false, `Name ${name} is too long. Maximum of 16 characters`];
  if (!/^[a-zA-Z0-9]+$/.test(name))
    return [
      false,
      `Name ${name} contains invalid characters. Only use alphanumeric characters.`,
    ];
  return [true, ``];
}

io.on(
  "connection",

  (client) => {
    console.debug(`Client connected`);
    // Player does not have a name until they choose one and create/join a lobby
    let currentPlayer = null;
    let playerLobbyId = null;

    client.on("createLobby", ({ name }) => {
      const [nameValid, error] = playerNameValid(name);
      if (!nameValid) {
        client.emit("error", error);
        return;
      }
      const { lobby, player } = createLobby(name);
      currentPlayer = player;
      playerLobbyId = lobby.id;
      client.join(playerLobbyId);
      client.join(player.id);
      client.emit("joinedLobby", { lobby, player });
      console.debug(`${player.name} created lobby ${playerLobbyId}`);
    });

    client.on("joinLobby", ({ name, lobbyId }) => {
      const [nameValid, error] = playerNameValid(name);
      if (!nameValid) {
        client.emit("error", error);
        return;
      }
      const [joinSuccess, joinResult] = joinLobby(lobbyId, name);
      if (!joinSuccess) {
        // If join didn't work `joinResult` contains an error message
        client.emit("error", joinResult);
        return;
      }
      const { lobby, player } = joinResult;
      playerLobbyId = lobby.id;
      currentPlayer = player;
      // Let the lobby know a new player joined
      lobby.synchronize();
      client.join(playerLobbyId);
      client.emit("joinedLobby", { lobby, player });

      console.debug(`${name} joined lobby ${lobbyId}`);
    });

    client.on("nfcScanned", ({ nfcTag }) => {
      nfcAction(currentPlayer, playerLobbyId, nfcTag);
    });

    client.on("gameStatusChange", ({ status }) => {
      const lobby = getLobby(playerLobbyId);
      lobby.status = status;
      lobby.synchronize();
    });

    client.on("disconnect", () => {
      console.debug(
        `Client disconnected ${currentPlayer ? currentPlayer.name : ""}`
      );
      if (playerLobbyId != null) {
        const lobby = removePlayer(playerLobbyId, currentPlayer.name);
        if (lobby != null) lobby.synchronize();
      }
    });
  }
);

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
