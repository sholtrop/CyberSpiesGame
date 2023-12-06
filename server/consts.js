// @ts-nocheck
export const MAX_PLAYERS = 5;

export const N_IMPOSTORS = 1;

export const MEETING_TIME = 60;

export const VOTE_RESULT_DISPLAY_SECS = 10;

export const TASK_PROGRESSION_VICTORY_AMOUNT = 100;

export const ROLE_DISPLAY_SECS = 60;

const N_TASKS_TO_WIN = 15;

// How much progression a single task gives to the progression bar
export const SINGLE_TASK_PROGRESSION_AMOUNT =
  TASK_PROGRESSION_VICTORY_AMOUNT / N_TASKS_TO_WIN;

// Update the progression bar only when this much progress has been made
// since the previous display update
export const TASK_PROGRESS_DISPLAY_THRESHOLD = 20;

export const PLAYER_COLORS = ["green", "blue", "yellow", "pink", "red"];

// Position in the array is the id of the activity. The id is encoded on the NFC tag.
export const NFC_ACTIVITIES = [
  "meeting",
  "simonsays",
  "wiretap1",
  "wiretap2",
  "wiretap3",
  "passwordcrack",
  "bitcoinmine",
  "killthevirus",
  "firewallbutton1",
  "firewallbutton2",
];

// Position in the array is the id of the task.
export const TASKS = [
  // TODO: descriptions
  {
    name: "simonsays",
    makeDescription: (activities) =>
      `Establish connection with secret correspondent in ${activities.simonsays.room}`,
  },
  {
    name: "wiretap",
    makeDescription: (activities) =>
      `Place wiretaps in ${activities.wiretap1.room}, ${activities.wiretap2.room} and ${activities.wiretap3.room}`,
  },
  {
    name: "passwordcrack",
    makeDescription: (activities) =>
      `Crack the password in ${activities.passwordcrack.room}`,
  },
  {
    name: "bitcoinmine",
    makeDescription: (activities) =>
      `Mine bitcoin in ${activities.bitcoinmine.room}`,
  },
  {
    name: "killthevirus",
    makeDescription: (activities) =>
      `Get rid of the virus in ${activities.killthevirus.room}`,
  },
];

// Number of minigames that are available in general
export const N_TOTAL_TASKS = TASKS.length;

// How many tasks do players get at a time
export const TASK_BATCH_SIZE = 3;

// For this amount of seconds after starting a new round, players cannot call emergency meetings
export const MEETING_BUTTON_CD = 20;

// How many emergency meetings a player may call per game
export const EMERGENCY_MEETINGS_PER_PLAYER = 1;

export const KILL_COOLDOWN_SECS = 20;

export const SABO_COOLDOWN_SECS = 20;

export const HACKED_SECS = 12;
export const HACK_COOLDOWN = 15;

export const VIRUS_SCAN_FAILED_PUNISH_SECS = 25;
export const VIRUS_SCAN_COOLDOWN = 30;

export const FIREWALL_FIX_TIME = 80;
export const FIREWALL_COOLDOWN = 60;
