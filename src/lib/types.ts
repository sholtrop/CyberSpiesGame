import type { NFC_ACTIVITIES, TASKS } from "./consts";

export type Lobby = {
  id: string;
  players: { [K in Color]: Player };
  creator: string;
  status:
    | { state: "settingRooms" }
    | { state: "inLobby"; readyPlayers: { [K in Color]: boolean } }
    | { state: "roleExplanation"; countDown: number }
    | { state: "started" }
    | {
        state: "meetingCalled";
        type: "emergency" | "bodyFound";
        presentPlayers: { [K in Color]: boolean };
      }
    | {
        state: "meeting";
        type: "emergency" | "bodyFound";
        countDown: number;
        votes: { [name: string]: string | null };
        nVoters: number;
      }
    | {
        state: "voteResultAnnounced";
        votedOutPlayer: string | null;
        countDown: number;
      }
    | { state: "gameEnded"; victors: "impostors" | "crew" };
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
  name: string;
  connection: "connected" | "disconnected";
  status: "alive" | "dead" | "foundDead";
  role: "crew" | "impostor" | "undecided";
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
      affectedPlayers: {
        color: Color;
        destinationRoom: string;
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
export type Color = "green" | "blue" | "yellow" | "white" | "red";

export type Task = {
  name: (typeof TASKS)[number];
  number: number;
  description: string;
  status: "available" | "completed";
};

// Game actions taken by players that the frontend needs to communicate to the backend
export type GameAction =
  | {
      action: "callMeeting";
      type: "emergency" | "bodyFound";
    }
  | {
      action: "vote";
      playerColor: Color;
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
  | {
      // Moved during the virus scan
      action: "virusScanFailed";
    };