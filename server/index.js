import { Server } from "socket.io";
import http from "http";
import { createLobby, joinLobby, removePlayer } from "./lobbies.js";

const server = http.createServer();

const io = new Server(server, { cors: "*" });

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
    let playerName = null;
    let playerLobbyId = null;

    client.on("createLobby", ({ name }) => {
      const [nameValid, error] = playerNameValid(name);
      if (!nameValid) {
        client.emit("error", error);
        return;
      }
      const lobby = createLobby(name);
      playerName = name;
      playerLobbyId = lobby.id;
      client.join(playerLobbyId);
      client.emit("joinedLobby", { lobby });

      console.debug(`${playerName} created lobby ${playerLobbyId}`);
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
      const lobby = joinResult;
      playerLobbyId = lobby.id;
      playerName = name;
      // Let the lobby know a new player joined
      client.to(playerLobbyId).emit("lobbyUpdate", { lobby });
      client.join(playerLobbyId);
      client.emit("joinedLobby", { lobby });

      console.debug(`${name} joined lobby ${lobbyId}`);
    });

    client.on("nfcScanned", (nfcTag) => {
      console.debug(`NFC tag has been scanned with number: ${nfcTag.number}`);
    });

    client.on("playerKilled", (data) => {
      client.broadcast(`playerKilled`, { playerName: `lochyin` });
    });

    client.on("disconnect", () => {
      console.debug(`Client disconnected`);
      if (playerLobbyId != null) {
        const lobby = removePlayer(playerLobbyId, playerName);
        if (lobby != null)
          client.to(playerLobbyId).emit("lobbyUpdate", { lobby });
      }
    });
  }
);

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
