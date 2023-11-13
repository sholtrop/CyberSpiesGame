import { io } from "./socketio.js";
import { createLobby, getLobby, joinLobby, removePlayer } from "./lobbies.js";
import { nfcAction } from "./nfc.js";
import { playerNameValid } from "./player.js";

io.on("connection", (client) => {
  console.debug(`Client connected`);
  // Player does not have a name until they choose one and create/join a lobby
  let currentPlayer = null;
  let playerLobby = null;

  client.on("createLobby", ({ name }) => {
    const [nameValid, error] = playerNameValid(name);
    if (!nameValid) {
      client.emit("error", error);
      return;
    }
    const { lobby, player } = createLobby(name);
    currentPlayer = player;
    playerLobby = lobby;
    client.join(playerLobby.id);
    client.join(player.id);
    client.emit("joinedLobby", { lobby });
    console.debug(`${player.name} created lobby ${playerLobby.id}`);
  });

  client.on("addRooms", ({ rooms }) => {
    if (currentPlayer == null || playerLobby == null) return;
    playerLobby.addRooms(rooms);
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
    playerLobby = lobby;
    currentPlayer = player;
    // Let the lobby know a new player joined
    lobby.synchronize();
    client.join(lobby.id);
    client.emit("joinedLobby", { lobby });

    console.debug(`${name} joined lobby ${lobby.id}`);
  });

  client.on("nfcScanned", ({ nfcTag }) => {
    nfcAction(currentPlayer, playerLobby, nfcTag);
  });

  client.on("startGame", () => {
    if (playerLobby != null) playerLobby.startGame();
  });

  client.on("disconnect", () => {
    console.debug(
      `Client disconnected ${currentPlayer ? currentPlayer.name : ""}`
    );
    if (playerLobby != null) {
      const lobby = removePlayer(playerLobby.id, currentPlayer.name);
      if (lobby != null) lobby.synchronize();
    }
  });
});

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
