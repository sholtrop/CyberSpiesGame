import { nanoid } from "nanoid";
import {
  ACTIVE_EFFECTS_BASE,
  FIREWALL_COOLDOWN,
  FIREWALL_FIX_TIME,
  KILL_COOLDOWN_SECS,
  MAX_PLAYERS,
  MEETING_BUTTON_CD,
  MEETING_TIME,
  N_IMPOSTORS,
  ROLE_DISPLAY_SECS,
  SABO_COOLDOWN_SECS,
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
    this.activeEffects = { ...ACTIVE_EFFECTS_BASE };
    this._lobbyDeleteTimeout = null;
    this._impostorCdInterval = null;
    this._destroyed = false;
  }

  // Emit the current lobby status to all players in the lobby
  synchronize() {
    if (this._destroyed) return;
    const lobbyState = this.serialize();
    io.to(this.id).emit("lobbyUpdate", { lobby: lobbyState });
  }

  // A light-weight synchronize that synchronizes ONLY the current countdown.
  // If the current lobby status does not have a countdown, this does nothing.
  synchronizeCountDown() {
    if (this._destroyed) return;
    if (this.status.countDown != null)
      io.to(this.id).emit("countDown", { count: this.status.countDown });
  }

  synchronizeCooldowns() {
    if (this._destroyed) return;
    const cooldowns = this.#getImpostors().reduce((cds, impostor) => {
      cds[impostor.color] = {
        killCooldown: impostor.role.killCooldown,
        sabotageCooldown: impostor.role.sabotageCooldown,
      };
      return cds;
    }, {});
    let firewall = null;
    if (this.activeEffects.firewallBreach != null) {
      firewall = this.activeEffects.firewallBreach.countDown;
    }

    io.to(this.id).emit("cooldownUpdate", { cooldowns, firewall });
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
    const votes = Object.values(this.players).reduce((votes, player) => {
      if (player.status === "alive") votes[player.color] = "noVote";
      return votes;
    }, {});

    this.status = {
      state: "meeting",
      type: this.status.type,
      countDown: MEETING_TIME,
      votes,
      caller: this.status.caller,
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

  killPlayer(targetColor, killerColor) {
    // We DON'T check whether killing is off cooldown because that is managed in the frontend.
    // This means the dev panel will allow kills even when it's on CD, which is what we want for tests.
    const target = this.players[targetColor];
    if (target != null) {
      target.status = "dead";
      this.players[killerColor].role.killCooldown = KILL_COOLDOWN_SECS;
      this.synchronize();
      return [true];
    } else {
      return [
        false,
        `Player with color ${targetColor} was not found in lobby ${this.id}`,
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
    this.synchronize();
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

  launchSabotage(impostorColor, sabotage) {
    // Does NOT check whether sabo is off cooldown to ease testing
    const { kind, target } = sabotage;
    console.log({ kind, target, sabotage, impostorColor });
    switch (kind) {
      case "firewallBreach":
        this.#startFirewallBreach(impostorColor);
        break;

      case "hackPlayer":
        break;

      case "virusScan":
        this.#startVirusScan();
        break;
    }
  }

  // Increase the taskbar with the completion of a single task
  // If the display value for the task bar is updated, it will happen after a random delay
  increaseTaskBar() {
    this.taskProgression.real += SINGLE_TASK_PROGRESSION_AMOUNT;

    if (this.taskProgression.real >= TASK_PROGRESSION_VICTORY_AMOUNT)
      return this.#endGame("crew", "All tasks completed");
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

  reconnectPlayer(color, id, client) {
    if (this.players[color].id !== id) {
      console.error(`Player ${color} tried to reconnect but id did not match`);
      return;
    }
    this.players[color].connection = "connected";

    if (this._lobbyDeleteTimeout != null) {
      clearTimeout(this._lobbyDeleteTimeout);
      this._lobbyDeleteTimeout = null;
      console.debug(
        `Lobby ${this.id} no longer scheduled for deletion because player reconnected`
      );
    }
    client.emit("reconnected", {
      success: true,
      lobby: this.serialize(),
      color,
    });

    this.synchronize();
    return this.players[color];
  }

  // Mark player as disconnected from the lobby.
  // If all players are disconnected also remove the lobby.
  // If player does not exist in this lobby, returns `null` if there is no lobby (anymore), else returns the lobby.
  disconnectPlayer(playerColor) {
    if (this.players[playerColor] != null)
      console.debug(
        `Player ${this.players[playerColor].name} disconnected from lobby ${this.id}`
      );
    this.players[playerColor].connection = "disconnected";

    const nConnectedPlayers = Object.values(this.players).filter(
      (p) => p.connection === "connected"
    ).length;

    // Remove lobby entirely after 1 minute if this is the last player left
    if (nConnectedPlayers === 0) {
      console.debug(
        `Lobby ${this.id} scheduled for deletion because it has no connected players left`
      );
      this._lobbyDeleteTimeout = setTimeout(() => {
        const nConnectedPlayers = Object.values(this.players).filter(
          (p) => p.connection === "connected"
        ).length;
        if (nConnectedPlayers === 0) {
          lobbies[this.id].destroy();
          delete lobbies[this.id];
          console.log(`Deleted lobby ${this.id}`);
        }
      }, 1000 * 60);

      return null;
    } else {
      this.synchronize();
      return this;
    }
  }

  // `buttonNumber` is 1 or 2
  pressFirewallButton(buttonNumber) {
    const breach = this.activeEffects.firewallBreach;
    if (breach != null) {
      if (buttonNumber === 1) breach.buttonsPressed.firewallbutton1 = true;
      else if (buttonNumber === 2) breach.buttonsPressed.firewallbutton2 = true;
    }
    this.synchronize();
  }

  #startVirusScan() {
    io.to(this.id).emit("virusScan");
  }

  #startFirewallBreach(impostorColor) {
    this.activeEffects.firewallBreach = {
      buttonsPressed: {
        firewallbutton1: false,
        firewallbutton2: false,
      },
      countDown: FIREWALL_FIX_TIME,
    };
    this.players[impostorColor].role.sabotageCooldown = FIREWALL_COOLDOWN;

    this.synchronize();
  }

  // Returns the color the player that should be voted out, or `null` if no player is voted out.
  // No player is voted out if at least half voted to skip, or if there is a tie.
  #determineVoteResult() {
    const { votes, nVoters } = this.status;
    const nTotalVotes = Object.values(votes).length;
    // Every player that voted skip (`null`) or did not vote, counts as a skip vote
    const nSkipVotes = Object.values(votes).filter(
      (vote) => vote === "skip"
    ).length;

    // Players that did not vote
    const noVoters = Object.values(votes).filter(
      (vote) => vote === "noVote"
    ).length;

    // At least half voted to skip, thus no one is voted out
    if (nSkipVotes >= Math.ceil(nTotalVotes / 2)) {
      return null;
    }
    // Else, tally the votes
    let votedOutPlayer = null;
    const tally = {};
    // Tally all the votes per player
    for (const vote of Object.values(votes)) {
      if (vote === "noVote") continue;
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
    if (votedOutPlayer != null) {
      this.killVotedOutPlayer(votedOutPlayer);
      const [victors, reason] = this.#determineVictors();
      if (victors != null) {
        this.#endGame(victors, reason);
        return;
      }
    }
    for (const player of Object.values(this.players)) {
      if (player.status === "dead") player.status = "foundDead";
    }

    this.status = {
      state: "voteResultAnnounced",
      votedOutPlayer,
      countDown: VOTE_RESULT_DISPLAY_SECS,
    };
    this.synchronize();
    const counter = setInterval(() => {
      this.status.countDown -= 1;
      this.synchronizeCountDown();
      if (this.status.countDown === 0) {
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
    this.#setImpostorCooldowns();
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
  // If the game should end, returns ["impostor", reason] or ["crew", reason], else returns [null].
  // Does NOT check for sabotage victories, as these are triggered instantly when the sabotage completes.
  #determineVictors() {
    // Impostors all dead - Crew win
    const impostorsLeft = Object.values(this.players).filter(
      ({ role, status }) => role.name === "impostor" && status === "alive"
    ).length;

    if (impostorsLeft === 0)
      return ["crew", "All secret agents were eliminated"];

    // Equal impostors and crew - Impostors win
    const crewLeft = Object.values(this.players).filter(
      ({ role, status }) => role.name === "crew" && status === "alive"
    ).length;

    if (crewLeft === impostorsLeft)
      return ["impostor", "Cyber criminals are no longer in the majority"];
    return [null];
  }

  // Instantly end the game, with a victory for `victors` ("crew" or "impostor")
  #endGame(victors, reason) {
    this.#removeIntervals();
    this.status = { state: "gameEnded", victors, reason };
    this.synchronize();
  }

  #endFirewallBreach() {
    this.activeEffects.firewallBreach = null;
    this.synchronize();
  }

  #assignRolesRandomly() {
    // First make everyone crew
    for (const color of Object.keys(this.players)) {
      this.players[color].role = { name: "crew" };
    }

    // Determine impostors
    const impostorColors = new Set();
    while (impostorColors.size < N_IMPOSTORS) {
      const players = Object.keys(this.players);
      const randPlayerColor = players[randInt(0, players.length - 1)];
      impostorColors.add(randPlayerColor);
    }

    // Set the selected players to impostor
    for (const impostorColor of impostorColors.values()) {
      this.players[impostorColor].role = {
        name: "impostor",
        killCooldown: KILL_COOLDOWN_SECS,
        sabotageCooldown: SABO_COOLDOWN_SECS,
      };
    }
    console.log(`Player roles decided`, JSON.stringify(this.players, null, 4));
  }

  #getImpostors() {
    return Object.values(this.players).filter(
      (p) => p.role.name === "impostor"
    );
  }

  // Starts the timer that handles impostor kill & sabotage cooldown, and the firewall breached timer
  #setImpostorCooldowns() {
    const impostors = this.#getImpostors();
    for (const player of impostors) {
      player.role.killCooldown = KILL_COOLDOWN_SECS;
      player.role.sabotageCooldown = SABO_COOLDOWN_SECS;
    }

    if (this._impostorCdInterval != null)
      clearInterval(this._impostorCdInterval);

    this._impostorCdInterval = setInterval(() => {
      // Only sync if a timer actually changed
      let sync = false;

      // Sabotage cooldown / Firewall breach do not tick down when game is paused,
      // e.g. because of a meeting
      const gamePaused = this.status.state !== "started";

      for (const player of impostors) {
        if (player.role.killCooldown > 0 && !gamePaused) {
          player.role.killCooldown -= 1;
          sync = true;
        }

        if (player.role.sabotageCooldown > 0 && !gamePaused) {
          player.role.sabotageCooldown -= 1;
          sync = true;
        }
      }
      if (
        this.activeEffects.firewallBreach != null &&
        !gamePaused &&
        this.activeEffects.firewallBreach.countDown > 0
      ) {
        const { buttonsPressed } = this.activeEffects.firewallBreach;
        if (buttonsPressed.firewallbutton1 && buttonsPressed.firewallbutton2) {
          this.#endFirewallBreach();
        } else {
          this.activeEffects.firewallBreach.countDown -= 1;
          if (this.activeEffects.firewallBreach.countDown === 0) {
            this.#endGame("impostor", "The Firewall was not repaired in time");
          }
          sync = true;
        }
      }
      if (sync) this.synchronizeCooldowns();
    }, 1000);
  }

  #removeIntervals() {
    if (this._impostorCdInterval != null)
      clearInterval(this._impostorCdInterval);
    if (this._lobbyDeleteTimeout != null)
      clearInterval(this._lobbyDeleteTimeout);
  }

  // Return lobby without any private properties (starting with _)
  serialize() {
    const lobbyState = { ...this };
    Object.keys(lobbyState).forEach((key) =>
      key.startsWith("_") ? delete lobbyState[key] : ""
    );
    return lobbyState;
  }

  // Cancel all intervals and make sure synchronize events do not reach a client. To be used before lobby is deleted.
  destroy() {
    this._destroyed = true;
    this.#removeIntervals();
  }
}

// Create lobby, return {lobby: lobby object, player: player object }
export function createLobby(creatorName) {
  const player = new Player({
    name: creatorName,
    status: "alive",
    connection: "connected",
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
    color,
  });

  lobby.players[color] = player;

  return [true, { lobby, player }];
}

export function getLobby(lobbyId) {
  return lobbies[lobbyId];
}
