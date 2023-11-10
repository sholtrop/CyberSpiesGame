import { nanoid } from "nanoid";
import { MAX_PLAYERS, TASK_PROGRESSION_VICTORY_AMOUNT } from "./consts.js";
import { io } from "./socketio.js";
import { Player } from "./player.js";

// Mapping of lobbyId -> lobby
const lobbies = {};

class Lobby {
  constructor({ id, players, creator, status }) {
    this.id = id;
    this.players = players;
    this.creator = creator;
    this.status = status;
    this.taskProgression = 0;
  }

  // Emit the current lobby status to all players in the lobby
  synchronize() {
    io.to(this.id).emit("lobbyUpdate", { lobby: this });
  }

  // Start a meeting in this lobby, depending on which type of meeting was previously called.
  // After the meeting is done, this method will then start the vote
  startMeeting() {
    const { state } = this.status;
    if (state !== "meetingCalled")
      throw Error(
        `Cannot start a meeting: No meeting was called beforehand. Lobby status was ${state}`
      );

    this.status = {
      state: "meeting",
      type: state.type,
      countDown: MEETING_TIME,
      votes: {},
      nVoters: this.nAlivePlayers(),
    };

    // Start the meeting by setting the timer to max, then count down every 1 second
    // Meeting ends when the countdown reaches 0, or when all players have voted
    const cancel = setInterval(() => {
      this.synchronize();
      this.status.countdown -= 1;
      const nVotes = Object.values(this.status.votes).length;
      if (this.status.countDown === 0 || nVotes === this.status.nVoters) {
        clearInterval(cancel);
        this.#stopVote();
      }
    }, 1000);
  }

  killPlayer(playerColor) {
    const target = this.players.find((player) => player.color === playerColor);
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
    return this.players.reduce(
      (n, player) => (player.status === "alive" ? n + 1 : n),
      0
    );
  }

  // Number of players that will need to attend the next meeting (== scan the meeting point)
  // I.e., all alive players + all unfound dead players
  nMeetingAttendees() {
    return this.players.reduce(
      (n, player) => (player.status !== "foundDead" ? n + 1 : n),
      0
    );
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

  #stopVote() {
    const votedOutPlayer = this.#determineVoteResult();
    if (votedOutPlayer != null) this.killPlayer(votedOutPlayer);

    const victors = this.#determineVictors();
    if (victors != null) this.#endGame();

    this.status = {
      state: "voteResultAnnounced",
      votedOutPlayer,
    };
    this.synchronize();
    setTimeout(() => {
      this.#startNewRound();
    }, VOTE_RESULT_DISPLAY_SECS);
  }

  // After a vote result has been announced and displayed for VOTE_RESULT_DISPLAY_SECS seconds,
  // a new round starts.
  #startNewRound() {
    // TODO set the state and synchronize
  }

  // Determine whether the game in its current state should end, and who the victors are.
  // If the game should end, returns "impostors" or "crew", else returns `null`.
  // Does NOT check for sabotage victories, as these are triggered instantly when the sabotage completes.
  #determineVictors() {
    // Tasks completed - Crew win
    if (this.taskProgression >= TASK_PROGRESSION_VICTORY_AMOUNT) return "crew";

    // Impostors all dead - Crew win
    const impostorsLeft = this.players.reduce(({ role, status }, n) => {
      if (role === "impostor" && status === "alive") return n + 1;
      else return n;
    }, 0);
    if (impostorsLeft === 0) return "crew";

    // Equal impostors and crew - Impostors win
    const crewLeft = this.players.reduce(({ role, status }, n) => {
      if (role === "crew" && status === "alive") return n + 1;
      else return n;
    }, 0);

    if (crewLeft === impostorsLeft) return "impostors";
  }

  // Instantly end the game, with a victory for `victors` ("crew" or "impostors")
  #endGame(victors) {
    this.status = { state: "gameEnded", victors };
    this.synchronize();
  }
}

// Create lobby, return {lobby: lobby object, player: player object }
export function createLobby(creatorName) {
  const player = new Player({
    id: nanoid(),
    name: creatorName,
    status: "alive",
    connection: "connected",
    role: "undecided",
  });
  const lobbyId = nanoid();
  const lobby = new Lobby({
    id: lobbyId,
    players: [player],
    creator: creatorName,
    status: "notStarted",
  });
  lobbies[lobbyId] = lobby;
  return { lobby, player };
}

// Join an existing lobby, return [false, `error string`] or [true, {lobby: lobby object, player: player object}]
export function joinLobby(lobbyId, playerName) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return [false, `Lobby with id ${lobbyId} does not exist`];

  const players = lobby.players;
  if (players.length === MAX_PLAYERS)
    return [false, `Maximum amount of players reached`];

  if (players.find(({ name }) => playerName === name))
    return [false, `Name ${playerName} is already taken`];

  // Give player a random, non-used color
  let color = randomPlayerColor();
  while (players.find(({ usedColor }) => usedColor === color) != null) {
    color = randomPlayerColor();
  }
  const player = {
    name: playerName,
    color,
    status: "connected",
  };
  players.push({
    name: playerName,
    color,
  });
  return [true, { lobby, player }];
}

// Remove player from an existing lobby. Also remove the lobby if this was the last player left.
// If player does not exist in this lobby, returns `null` if there is no lobby (anymore), else returns the lobby.
export function removePlayer(lobbyId, playerName) {
  const lobby = lobbies[lobbyId];
  if (lobby == null) return null;
  const playerIdx = lobby.players.findIndex(({ name }) => name === playerName);
  console.debug(`Player ${playerName} left lobby ${lobbyId}`);
  // Remove lobby entirely if no players are left
  if (lobby.players.length === 0) {
    delete lobbies[lobbyId];
    console.debug(`Remove lobby ${lobbyId} because it has no players left`);
    return null;
  }
  // Remove the player from the list of players
  lobby.players.splice(playerIdx, 1); // Delete player from array of players
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
