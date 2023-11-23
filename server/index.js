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
    client.emit("joinedLobby", { lobby, color: player.color });
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

  client.on("gameAction", ({ action, ...info }) => {
    switch (action) {
      case "callMeeting":
        playerLobby?.startMeetingCall(info.type, currentPlayer.color);
        break;
      case "vote":
        playerLobby?.addVote(currentPlayer.color, info.playerColor);
        break;
      case "killPlayer":
        playerLobby?.killPlayer(info.playerColor);
        break;
      case "startTask":
        currentPlayer?.startTask(taskNumber);
        playerLobby?.synchronize();
        break;
      case "startSabotageFix":
        currentPLayer?.startSabotageFix();
        playerLobby?.synchronize();
        break;
      case "taskCompleted":
        currentPlayer?.finishTask(info.taskNumber);
        // increaseTaskBar will synchronize lobby state
        playerLobby?.increaseTaskBar();
        break;
      case "sabotageFixCompleted":
        currentPlayer?.finishSabotageFix();
        // TODO: cancel everyone else's sabotage fix
        playerLobby?.synchronize();
        break;
      case "virusScanFailed":
        // TODO: Lock player out of completing scan actions
        break;
    }
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

  client.on("devSetLobby", ({ lobby }) => {
    if (playerLobby == null) {
      console.error(`Cannot set a lobby; must join a lobby first`);
      return;
    }
    console.debug(`Updating lobby`);
    for (const key of Object.keys(playerLobby)) {
      if (lobby[key] !== undefined) {
        playerLobby[key] = lobby[key];

        console.debug(`Changed lobby.${key} to ${JSON.stringify(lobby[key])}`);
      }
    }
    playerLobby.synchronize();
  });
});

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
