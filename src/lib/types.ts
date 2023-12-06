import type { NFC_ACTIVITIES } from "./consts";

export type Lobby = {
  id: string;
  players: { [K in Color]: Player };
  creator: string;
  status:
    | { state: "settingRooms" }
    | { state: "inLobby"; readyPlayers: { [K in Color]: boolean } }
    | { state: "roleExplanation"; countDown: number }
    | { state: "started"; countDown: number }
    | {
        state: "meetingCalled";
        type: "emergency" | "bodyFound";
        caller: Color;
        presentPlayers: { [K in Color]: boolean };
        // is null when meeting is emergency
        deadPlayer: Color | null;
      }
    | {
        state: "meeting";
        type: "emergency" | "bodyFound";
        caller: Color;
        countDown: number;
        votes: { [K in Color]: Color | null };
        nVoters: number;
      }
    | {
        state: "voteResultAnnounced";
        votedOutPlayer: string | null;
        countDown: number;
      }
    | { state: "gameEnded"; victors: "impostor" | "crew" };
  // Between 0 and 100. At 100, crew win the game.
  // Has a displayed value and a real value.
  // Displayed value may differ from the actual value.
  taskProgression: {
    real: number;
    displayed: number;
  };
  activities: NfcActivities;
  activeEffects: Effect[];
};

export type Player = {
  id: string;
  name: string;
  connection: "connected" | "disconnected";
  status: "alive" | "dead" | "foundDead";
  role:
    | { name: "crew" }
    | { name: "impostor"; killCooldown: number; sabotageCooldown: number }
    | { name: "undecided" };
  emergencyMeetingsLeft: number;
  color: Color;
  tasks: Task[];
  currentlyDoing:
    | {
        activity: "task";
        number: number;
      }
    | {
        activity: "nothing";
      }
    | {
        activity: "fixSabotage";
      };
};

// A room has a name and one or more activities (NFC tags)
export type NfcActivities = {
  [name: string]: {
    id: number;
    room: string;
    name: (typeof NFC_ACTIVITIES)[number];
  };
};

// Effects that are active in the lobby, from e.g. impostor powers
export type Effect =
  | {
      // A player affected by this is unable to scan anything
      effect: "hacked";
      affectedPlayers: Color[];
    }
  | {
      // Sabotage that forces one or more players to go to
      // a specific destination room and scan its NFC tag to fix it.
      // Failing to do so before the countDown reaches 0 results in impostor victory
      effect: "firewallBreach";
      buttonsPressed: {
        firewallbutton1: boolean;
        firewallbutton2: boolean;
      };
      countDown: number;
    }
  | {
      // Sabotage that forces all affected players to stand still (checked by their mobile device)
      // If they fail, they will become affected by 'hacked'
      effect: "virusScan";
      affectedPlayers: Color[];
    };

// Each player has one of these colors assigned to them
export type Color = "green" | "blue" | "yellow" | "pink" | "red";

export type Task = {
  name: string;
  number: number;
  description: string;
  status: "available" | "completed";
};

// Game actions taken by players that the frontend needs to communicate to the backend
export type GameAction =
  | {
      action: "callMeeting";
    }
  | {
      action: "reportDeadBody";
      bodyColor: Color;
    }
  // Enter the currently called meeting
  | { action: "enterMeeting" }
  | {
      action: "vote";
      vote: Vote;
    }
  | {
      action: "killPlayer";
      playerColor: Color;
    }
  | {
      action: "startTask";
      taskNumber: number;
    }
  | {
      action: "startSabotageFix";
    }
  | {
      action: "taskCompleted";
      taskNumber: number;
    }
  | {
      action: "sabotageFixCompleted";
    }
  // Player ready in lobby
  | { action: "playerReady" };

export type Vote = Color | "noVote" | "skip";
