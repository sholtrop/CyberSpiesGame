import { io, server } from "./socketio.js";
import { createLobby, getLobby, joinLobby } from "./lobbies.js";
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
    client.emit("joinedLobby", { lobby, color: player.color, id: player.id });
    console.debug(`${player.name} created lobby ${playerLobby.id}`);
  });

  client.on("setActivities", ({ activities }) => {
    if (currentPlayer == null || playerLobby == null) {
      console.error(`Cannot set activities as one of these is null`, {
        currentPlayer,
        playerLobby,
      });
      return;
    }
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
        if (currentPlayer?.emergencyMeetingsLeft > 0) {
          currentPlayer.emergencyMeetingsLeft -= 1;
          playerLobby?.startMeetingCall("emergency", currentPlayer?.color);
        } else {
          console.error(
            `Player ${currentPlayer.name} has no emergency meetings left but tried to call one`
          );
        }
        break;
      case "enterMeeting":
        playerLobby?.addPlayerToMeeting(currentPlayer?.color);
        break;
      case "playerReady":
        playerLobby?.addReady(currentPlayer.color);
        break;
      case "vote":
        playerLobby?.addVote(currentPlayer.color, info.vote);
        break;
      case "reportDeadBody":
        playerLobby?.startMeetingCall(
          "bodyFound",
          currentPlayer?.color,
          info.bodyColor
        );
        break;
      case "killPlayer":
        playerLobby?.killPlayer(info.targetColor, currentPlayer.color);
        break;
      case "startTask":
        currentPlayer?.startTask(info.taskNumber);
        playerLobby?.synchronize();
        break;
      case "startFirewallFix":
        currentPlayer?.startFirewallFix(info.number);
        playerLobby?.synchronize();
        break;
      case "taskCompleted":
        currentPlayer?.finishTask(info.taskNumber);
        if (currentPlayer?.role.name === "crew") playerLobby?.increaseTaskBar();

        // Give player new tasks if they've completed all of them
        if (currentPlayer?.tasks.every((t) => t.status === "completed")) {
          console.debug("Give new tasks");
          currentPlayer?.assignTasks(playerLobby?.activities);
        }
        playerLobby?.synchronize();
        break;
      case "finishFirewallFix":
        currentPlayer?.finishFirewallFix(info.number);
        playerLobby?.pressFirewallButton(info.number);
        // TODO: cancel everyone else's firewall fix for this number
        break;
      case "launchSabotage":
        playerLobby.launchSabotage(currentPlayer.color, info.sabotage);
        break;
    }
  });

  client.on("startGame", () => {
    if (playerLobby != null) playerLobby.startGame();
  });

  client.on("reconnect", ({ color, playerId, lobbyId }) => {
    const lobby = getLobby(lobbyId);
    if (!lobby) {
      console.debug(`Lobby ${lobbyId} does not exist anymore, can't reconnect`);
      client.emit("reconnected", { success: false });
      return;
    }
    playerLobby = lobby;
    client.join(lobby.id);
    currentPlayer = playerLobby.reconnectPlayer(color, playerId, client);

    console.debug(`Client reconnected ${currentPlayer.name}`);

    console.debug(`Player ${currentPlayer.name} reconnected successfully`);
  });

  client.on("disconnect", () => {
    console.debug(
      `Client disconnected ${currentPlayer ? currentPlayer.name : ""}`
    );
    playerLobby?.disconnectPlayer(currentPlayer?.color);
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
  });
});

const port = 3000;
console.debug(`Listening on ${port}`);

server.listen(port);
