import { getLobby, killPlayer } from "./lobbies.js";

// Perform the action associated with the scanned `nfcTag`
export function nfcAction(player, lobbyId, nfcTag) {
  console.debug(`NFC tag has been scanned with contents: ${nfcTag}`);
  const [action, info] = nfcTag.split(":");
  const lobby = getLobby(lobbyId);
  switch (action) {
    case "player":
      // Scanning another player as crew does not do anything (yet?)
      if (player.role !== "impostor") return;
      killPlayer(lobbyId, player.color);
      break;
    case "task":
      break;
    case "meeting":
      break;
  }
}
