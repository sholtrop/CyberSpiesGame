import { killPlayer } from "./lobbies";

// Perform the action associated with the scanned `nfcTag`
export function nfcAction(player, lobbyId, nfcTag) {
  console.debug(`NFC tag has been scanned with contents: ${nfcTag}`);
  const [action, info] = nfcTag.split(":");
  switch (action) {
    case "player":
      killPlayer(lobbyId, player.color);
      break;
    case "task":
      break;
    case "meeting":
      break;
  }
}
