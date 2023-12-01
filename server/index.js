import { io } from "./socketio.js";
import { createLobby, joinLobby, removePlayer } from "./lobbies.js";
import { playerNameValid } from "./player.js";

io.on("connection", (client) => {
  console.debug(`Client connected`);
  // Player does not have a name until they choose one and create/join a lobby
  let currentPlayer = null;
  let playerLobby = null;

  client.on("createLobby", ({ name }) => {
    const [nameValid, error] = playerNameValid(name);
    if (!nameValid) {
      client.emit("error", { error });
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

  client.on("setActivities", ({ activities }) => {
    if (currentPlayer == null || playerLobby == null) return;
    playerLobby.setActivities(activities);
  });

  client.on("joinLobby", ({ name, lobbyId }) => {
    const [nameValid, error] = playerNameValid(name);
    if (!nameValid) {
      client.emit("error", { error });
      return;
    }
    const [joinSuccess, joinResult] = joinLobby(lobbyId, name);
    if (!joinSuccess) {
      // If join didn't work `joinResult` contains an error message
      client.emit("error", { error: joinResult });
      return;
    }
    const { lobby, player } = joinResult;
    playerLobby = lobby;
    currentPlayer = player;
    // Let the lobby know a new player joined
    lobby.synchronize();
    client.join(lobby.id);
    client.emit("joinedLobby", { lobby, color: player.color });

    console.debug(`${name} joined lobby ${lobby.id}`);
  });

  client.on("gameAction", ({ action, ...info }) => {
    console.debug("gameAction", { action, ...info });
    switch (action) {
      case "callMeeting":
        playerLobby?.startMeetingCall("emergency", currentPlayer?.color);
        break;
      case "enterMeeting":
        playerLobby?.addPlayerToMeeting(currentPlayer?.color);
        break;
      case "playerReady":
        playerLobby?.addReady(currentPlayer.color);
        break;
      case "vote":
        playerLobby?.addVote(currentPlayer.color, info.playerColor);
        break;
      case "reportDeadBody":
        playerLobby?.startMeetingCall(
          "bodyFound",
          currentPlayer?.color,
          info.bodyColor
        );
        break;
      case "killPlayer":
        playerLobby?.killPlayer(info.playerColor);
        break;
      case "startTask":
        currentPlayer?.startTask(info.taskNumber);
        playerLobby?.synchronize();
        break;
      case "startSabotageFix":
        currentPlayer?.startSabotageFix();
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
      const lobby = removePlayer(playerLobby.id, currentPlayer.color);
      if (lobby != null) lobby.synchronize();
    }
  });

  client.on("devSetLobby", ({ lobby }) => {
    if (playerLobby == null) {
      console.error(`Cannot set a lobby; must join a lobby first`);
      return;
    }
    console.debug(`DEV: lobby`);
    for (const key of Object.keys(playerLobby)) {
      if (lobby[key] !== undefined) {
        playerLobby[key] = lobby[key];

        console.debug(
          `DEV: Changed lobby.${key} to ${JSON.stringify(lobby[key])}`
        );
      }
    }
    playerLobby.synchronize();
  });

  client.on("devChangeTasks", () => {
    currentPlayer?.assignTasks();
    playerLobby?.synchronize();
  });

  client.on("restartLobby", () => {
    // TODO
    throw Error("not implemented");
  })
});

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
