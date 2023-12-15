export { TASKS, N_TOTAL_TASKS, NFC_ACTIVITIES } from "../../server/consts";

export const MINIMUM_N_PLAYERS = 5;

// N.B. not all of these are actually used.
// Look at backend to find out which colors are used.
export const COLORS = {
  red: "bg-red-600",
  orange: "bg-orange-600",
  yellow: "bg-yellow-400",
  green: "bg-green-600",
  blue: "bg-blue-600",
  purple: "bg-purple-700",
  white: "bg-white",
  pink: "bg-pink-400",
} as { [key: string]: string };

// Pressing ctrl and this key will open/close the dev panel
export const DEV_PANEL_KEY = ".";

// 10 seconds
export const VIRUS_SCAN_TIME = 10;

export const VIRUS_FAIL_TIME = 25;

// Hard-coded for now
export const dev = true;
