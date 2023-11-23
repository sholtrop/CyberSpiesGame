// Perform the action associated with the scanned `nfcTag`
// export function nfcAction(player, lobby, nfcTag) {
//   console.debug(`NFC tag has been scanned with contents: ${nfcTag}`);
//   const [action, info] = nfcTag.split(":");
//   switch (action) {
//     case "player":
//       handlePlayerScanned(lobby, player, info);
//       break;
//     case "task":
//       handleTaskScanned(player, info);
//       break;
//     case "meeting":
//       handleMeetingPointScanned(player, lobby);
//       break;
//   }
// }

// function handlePlayerScanned(lobby, player, targetColor) {
//   // Scanning your own NFC tag does nothing
//   if (targetColor === player.color) return;
//   const target = lobby.find((player) => player.color === targetColor);
//   // Impostor kills a crew member
//   if (
//     player.role === "impostor" &&
//     target.role === "crew" &&
//     target.status === "alive"
//   )
//     target.status = "dead";
//   // Impostor or crew reports a dead body
//   else if (target.status === "dead") {
//     target.status = "foundDead";
//   }
// }

// function handleTaskScanned(player, taskNumber) {
//   if (player.role === "crew") {
//     const task = player.tasks.find((task) => task.number === taskNumber);
//     if (task == null)
//       // Player did not have this task
//       return;
//     // Scanning a task the first time activates it
//     if (task.status === "available") task.status = "doing";
//     // Scanning a task the second time completes it
//     // A player does not get access to the scanner again until they complete the task,
//     // so this should not happen accidentally
//     else if (task.status === "doing") task.status = "completed";
//   } else if (player.role === "impostor") {
//     // TODO: Decide what scanning a task as impostor does
//   }
// }

// function handleMeetingPointScanned(player, lobby) {
//   // Players that are dead and have already been found do not need to scan the meeting point to start a meeting.
//   // Players that have died _this round_ however, must scan the meeting point.
//   if (player.status === "foundDead") return;
//   const state = lobby.status.state;

//   switch (state) {
//     case "meetingCalled":
//       lobby.addPlayerToMeeting(player.color);
//       break;

//     case "started":
//       lobby.startMeetingCall("emergency", player.color);
//       break;
//   }
// }
