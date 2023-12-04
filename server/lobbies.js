import { nanoid } from "nanoid";
import {
  MAX_PLAYERS,
  MEETING_BUTTON_CD,
  MEETING_TIME,
  N_IMPOSTORS,
  ROLE_DISPLAY_SECS,
  SINGLE_TASK_PROGRESSION_AMOUNT,
  TASK_PROGRESSION_VICTORY_AMOUNT,
  VOTE_RESULT_DISPLAY_SECS,
} from "./consts.js";
import { io } from "./socketio.js";
import { Player, randomPlayerColor } from "./player.js";
import { randInt } from "./util.js";

// Mapping of lobbyId -> lobby
const lobbies = {};

class Lobby {
  constructor({ id, players, creator, status }) {
    this.id = id;
    this.players = players;
    this.creator = creator;
    this.status = status;
    this.taskProgression = { real: 0, displayed: 0 };
    this.activities = null;
    this.activeEffects = [];
  }

  // Emit the current lobby status to all players in the lobby
  synchronize() {
    io.to(this.id).emit("lobbyUpdate", { lobby: this });
  }

  // A light-weight synchronize that synchronizes ONLY the current countdown.
  // If the current lobby status does not have a countdown, this does nothing.
  synchronizeCountDown() {
    if (this.status.countDown != null)
      io.to(this.id).emit("countDown", { count: this.status.countDown });
  }

  // Start the game for this lobby. Will decide a role for each player and show
  // them information about this role for `ROLE_DISPLAY_SECS`, then start the actual game.
  startGame() {
    this.#assignTasks();
    this.#assignRolesRandomly();
    this.status = { state: "roleExplanation", countDown: ROLE_DISPLAY_SECS };
    this.synchronize();

    const cancel = setInterval(() => {
      this.status.countDown -= 1;
      this.synchronizeCountDown();
      if (this.status.countDown === 0) {
        clearInterval(cancel);
        this.#startNewRound();
      }
    }, 1000);
  }

  // Start a meeting call for a certain `type` of meeting: "emergency" or "bodyFound"
  // The color of the player that called the meeting must be passed in `initiatorColor`.
  startMeetingCall(type, initiatorColor, deadPlayer = null) {
    // Meetings can only be called when the game is running
    if (this.status.state !== "started") return;
    if (type !== "emergency" && type !== "bodyFound")
      throw Error(`Meeting type invalid: ${type}`);
    this.status = {
      state: "meetingCalled",
      type,
      presentPlayers: {},
      caller: initiatorColor,
      deadPlayer,
    };
    // If the meeting is an emergency meeting, the initiator just scanned
    // the meeting point, and is therefore already present.
    if (type === "emergency") this.status.presentPlayers[initiatorColor] = true;

    // TODO calling a meeting is special, and it interrupts/disables a lot of things:
    // - Tasks are cancelled and left uncompleted
    // - Killing is not possible
    // - Hacks are cleared
    // - Sabotages are paused?
    // - New hacks/sabotages cannot be performed
    this.synchronize();
  }

  addPlayerToMeeting(playerColor) {
    if (this.status.state !== "meetingCalled") return;
    const presentPlayers = this.status.presentPlayers;
    presentPlayers[playerColor] = true;
    const nPresentPlayers = Object.values(presentPlayers).reduce(
      (total, present) => (present ? total + 1 : total),
      0
    );

    if (nPresentPlayers === this.nMeetingAttendees()) this.startMeeting();
    else this.synchronize();
  }

  // Start a meeting in this lobby, depending on which type of meeting was previously called.
  // After the meeting is done, this method will then start the vote
  startMeeting() {
    if (this.status.state !== "meetingCalled")
      throw Error(
        `Cannot start a meeting: No meeting was called beforehand. Lobby status was ${state}`
      );

    this.status = {
      state: "meeting",
      type: this.status.type,
      countDown: MEETING_TIME,
      votes: {},
      nVoters: this.nAlivePlayers(),
    };

    this.synchronize();
    // Start the meeting by setting the timer to max, then count down every 1 second
    // Meeting ends when the countdown reaches 0, or when all players have voted
    const cancel = setInterval(() => {
      this.status.countDown -= 1;
      this.synchronizeCountDown();
      const nVotes = Object.values(this.status.votes).length;
      if (this.status.countDown === 0 || nVotes === this.status.nVoters) {
        clearInterval(cancel);
        this.#stopVote();
      }
    }, 1000);
  }

  killVotedOutPlayer() {
    const target = this.players[playerColor];
    if (target != null) {
      target.status = "foundDead";
      this.synchronize();
      return [true];
    } else {
      return [
        false,
        `Player with color ${playerColor} was not found in lobby ${this.id}`,
      ];
    }
  }

  killPlayer(playerColor) {
    const target = this.players[playerColor];
    if (target != null) {
      target.status = "dead";
      this.synchronize();
      return [true];
    } else {
      return [
        false,
        `Player with color ${playerColor} was not found in lobby ${this.id}`,
      ];
    }
  }

  addReady(playerColor) {
    if (this.status.state !== "inLobby")
      throw Error(
        `Cannot add ready when game is in state ${this.status.state}`
      );
    this.status.readyPlayers[playerColor] = true;
    this.synchronize();
  }

  // Add the vote of player with `color`. The `vote` is the color of the player
  // that the voter wants to eliminate, or `null` if the voters wants to skip.
  addVote(voterColor, vote) {
    const { state } = this.status;
    if (state !== "meeting")
      throw Error(
        `${voterColor} tried to cast a vote in lobby ${this.id}, but the lobby is not in a meeting. State was: ${state}`
      );
    const { votes } = this.status;
    votes[voterColor] = vote;
  }

  // Total number of players, both impostors and crew, that are not dead
  nAlivePlayers() {
    return Object.values(this.players).reduce(
      (n, player) => (player.status === "alive" ? n + 1 : n),
      0
    );
  }

  // Number of players that will need to attend the next meeting (== scan the meeting point)
  // I.e., all alive players + all unfound dead players
  nMeetingAttendees() {
    return Object.values(this.players).reduce(
      (n, player) => (player.status !== "foundDead" ? n + 1 : n),
      0
    );
  }

  // Sets the list of activities with their rooms for this lobby
  setActivities(activities) {
    this.activities = activities;
    this.status = { state: "inLobby", readyPlayers: {} };
    this.synchronize();
  }

  // Increase the taskbar with the completion of a single task
  // If the display value for the task bar is updated, it will happen after a random delay
  increaseTaskBar() {
    this.taskProgression.real += SINGLE_TASK_PROGRESSION_AMOUNT;

    // If this is the last task, end the game
    const victors = this.#determineVictors();
    if (victors != null) return this.#endGame(victors);
    this.synchronize();

    // Update the displayed value after a random delay
    setTimeout(() => {
      this.taskProgression.displayed =
        Math.floor(
          this.taskProgression.real / TASK_PROGRESS_DISPLAY_THRESHOLD
        ) * TASK_PROGRESS_DISPLAY_THRESHOLD;
      this.synchronize();
    }, randInt(3, 8) * 1000);
  }

  // Returns the color the player that should be voted out, or `null` if no player is voted out.
  // No player is voted out if at least half voted to skip, or if there is a tie.
  #determineVoteResult() {
    const { votes, nVoters } = this.status;
    const nTotalVotes = Object.values(votes).length;
    // Every player that voted skip (`null`) or did not vote, counts as a skip vote
    const nSkipVotes =
      Object.values(votes).filter((vote) => vote === null).length +
      (nVoters - nTotalVotes);

    // At least half voted to skip, thus no one is voted out
    if (nSkipVotes >= Math.ceil(nTotalVotes / 2)) {
      return null;
    }
    // Else, tally the votes
    let votedOutPlayer = null;
    const tally = {};
    // Tally all the votes per player
    for (const vote of Object.values(votes)) {
      if (tally[vote] != null) tally[vote] += 1;
      else tally[vote] = 1;
    }
    // Find the colors of the players with the highest number of votes
    let highestVotePlayers = [];
    let max = 0;
    for (const [color, count] of Object.entries(tally)) {
      // We not only find the max; we also count every player
      // that has this specific max to check for ties later
      if (count > max) {
        max = count;
        highestVotePlayers = [color];
      } else if (count === max) highestVotePlayers.push(color);
    }

    // If only one player has the highest vote count, there are no ties and they are voted out.
    if (highestVotePlayers.length === 1) {
      votedOutPlayer = highestVotePlayers[0];
    }
    return votedOutPlayer;
  }

  #assignTasks() {
    for (const player of Object.values(this.players)) {
      player.assignTasks(this.activities);
    }
  }

  #stopVote() {
    const votedOutPlayer = this.#determineVoteResult();
    if (votedOutPlayer != null) this.killPlayer(votedOutPlayer);

    const victors = this.#determineVictors();
    if (victors != null) this.#endGame();

    this.status = {
      state: "voteResultAnnounced",
      votedOutPlayer,
      countDown: VOTE_RESULT_DISPLAY_SECS,
    };
    this.synchronize();
    const counter = setInterval(() => {
      this.status.countDown -= 1;
      this.synchronizeCountDown();
      if (this.countDown === 0) {
        clearInterval(counter);
        this.#startNewRound();
      }
    }, 1000);
  }

  // After a vote result has been announced and displayed for VOTE_RESULT_DISPLAY_SECS seconds,
  // a new round starts.
  #startNewRound() {
    this.status = {
      state: "started",
      countDown: MEETING_BUTTON_CD,
    };
    this.synchronize();
    const cancel = setInterval(() => {
      this.status.countDown -= 1;
      this.synchronizeCountDown();
      if (this.status.countDown === 0) {
        clearInterval(cancel);
      }
    }, 1000);
  }

  // Determine whether the game in its current state should end, and who the victors are.
  // If the game should end, returns "impostors" or "crew", else returns `null`.
  // Does NOT check for sabotage victories, as these are triggered instantly when the sabotage completes.
  #determineVictors() {
    // Tasks completed - Crew win
    if (this.taskProgression.real >= TASK_PROGRESSION_VICTORY_AMOUNT)
      return "crew";

    // Impostors all dead - Crew win
    const impostorsLeft = Object.values(this.players).reduce(
      ({ role, status }, n) => {
        if (role === "impostor" && status === "alive") return n + 1;
        else return n;
      },
      0
    );
    if (impostorsLeft === 0) return "crew";

    // Equal impostors and crew - Impostors win
    const crewLeft = Object.values(this.players).reduce(
      ({ role, status }, n) => {
        if (role === "crew" && status === "alive") return n + 1;
        else return n;
      },
      0
    );

    if (crewLeft === impostorsLeft) return "impostors";
    return null;
  }

  // Instantly end the game, with a victory for `victors` ("crew" or "impostors")
  #endGame(victors) {
    this.status = { state: "gameEnded", victors };
    this.synchronize();
  }

  #assignRolesRandomly() {
    // First make everyone crew
    for (const color of Object.keys(this.players)) {
      this.players[color].role = "crew";
    }

    // Determine impostors
    const impostorColors = new Set();
    while (impostorColors.size < N_IMPOSTORS) {
      const players = Object.keys(this.players);
      const randPlayerColor = players[randInt(0, players.length - 1)];
      impostorColors.add(randPlayerColor);
    }

    // Set the selected players to impostor
    for (const impostorColor of impostorColors) {
      this.players[impostorColor].role = "impostor";
    }
    console.log(`Player roles decided`, JSON.stringify(this.players, null, 4));
  }
}

// Create lobby, return {lobby: lobby object, player: player object }
export function createLobby(creatorName) {
  const player = new Player({
    name: creatorName,
    status: "alive",
    connection: "connected",
    role: "undecided",
  });
  const lobbyId = nanoid();
  const lobby = new Lobby({
    id: lobbyId,
    players: { [player.color]: player },
    creator: creatorName,
    status: { state: "settingRooms", readyPlayers: {} },
  });
  lobbies[lobbyId] = lobby;
  return { lobby, player };
}

// Join an existing lobby, return [false, `error string`] or [true, {lobby: lobby object, player: player object}]
export function joinLobby(lobbyId, playerName) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return [false, `Lobby with id ${lobbyId} does not exist`];

  const players = lobby.players;
  if (Object.values(players).length === MAX_PLAYERS)
    return [false, `Maximum amount of players reached`];

  if (Object.values(players).find(({ name }) => playerName === name))
    return [false, `Name ${playerName} is already taken`];

  // Give player a random, non-used color
  let color = randomPlayerColor();
  // Loop until we find a color that is not in use yet
  while (players[color] != null) {
    color = randomPlayerColor();
  }
  const player = new Player({
    name: playerName,
    status: "alive",
    connection: "connected",
    role: "undecided",
    color,
  });

  lobby.players[color] = player;

  return [true, { lobby, player }];
}

// Remove player from an existing lobby. Also remove the lobby if this was the last player left.
// If player does not exist in this lobby, returns `null` if there is no lobby (anymore), else returns the lobby.
export function removePlayer(lobbyId, playerColor) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return null;

  if (lobby.players[playerColor] != null)
    console.debug(
      `Player ${lobby.players[playerColor].name} left lobby ${lobbyId}`
    );
  delete lobby.players[playerColor];
  // Remove lobby entirely if this is the last player left
  if (Object.values(lobby.players).length === 0) {
    delete lobbies[lobbyId];
    console.debug(`Remove lobby ${lobbyId} because it has no players left`);
    return null;
  }
  return lobby;
}

export function getLobby(lobbyId) {
  return lobbies[lobbyId];
}

export function killPlayer(lobbyId, playerColor) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return [false, `Lobby with id ${lobbyId} does not exist`];
  const [ok, err] = lobby.killPlayer(playerColor);
  if (ok) return [true];
  if (err) return [false, err];
}
