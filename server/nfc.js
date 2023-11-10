import { getLobby } from "./lobbies.js";

// Perform the action associated with the scanned `nfcTag`
export function nfcAction(player, lobbyId, nfcTag) {
  console.debug(`NFC tag has been scanned with contents: ${nfcTag}`);
  const [action, info] = nfcTag.split(":");
  const lobby = getLobby(lobbyId);
  switch (action) {
    case "player":
      handlePlayerScanned(lobby, player, info);
      break;
    case "task":
      handleTaskScanned(player, info);
      break;
    case "meeting":
      break;
  }
}

function handlePlayerScanned(lobby, player, targetColor) {
  // Scanning your own NFC tag does nothing
  if (targetColor === player.color) return;
  const target = lobby.find((player) => player.color === targetColor);
  // Impostor kills a crew member
  if (
    player.role === "impostor" &&
    target.role === "crew" &&
    target.status === "alive"
  )
    target.status = "dead";
  // Impostor or crew reports a dead body
  else if (target.status === "dead") {
    target.status = "foundDead";
  }
}

function handleTaskScanned(player, task) {
  // Scanning a task has no effect if impostor
  if (player.role === "crew") {
    if (task.status === "started")
      return; // TODO: register player as being in a task
    else if (task.status === "completed") return; // TODO: register completion of a task
  }
}

function handleMeetingScanned(player, lobby) {
  // Players that are dead and have already been found do not need to scan the meeting point to start a meeting.
  // Players that have died _this round_ however, must scan the meeting point.
  if (player.status === "foundDead") return;
  const state = lobby.status.state;

  switch (state) {
    case "meetingCalled":
      const { presentPlayers } = lobby.status;
      presentPlayers.add(player.name);
      if (presentPlayers.size === lobby.nMeetingAttendees()) {
        lobby.startMeeting();
      }
      break;

    case "started":
      lobby.status = {
        state: "meetingCalled",
        type: "emergency",
        presentPlayers: new Set(),
      };
      break;
  }
}
