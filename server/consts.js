export const MAX_PLAYERS = 5;

export const N_IMPOSTORS = 1;

export const MEETING_TIME = 60;

export const VOTE_RESULT_DISPLAY_SECS = 10;

export const TASK_PROGRESSION_VICTORY_AMOUNT = 100;

export const ROLE_DISPLAY_SECS = 30;

const N_TASKS_TO_WIN = 15;

// How much progression a single task gives to the progression bar
export const SINGLE_TASK_PROGRESSION_AMOUNT =
  TASK_PROGRESSION_VICTORY_AMOUNT / N_TASKS_TO_WIN;

// Update the progression bar only when this much progress has been made
// since the previous display update
export const TASK_PROGRESS_DISPLAY_THRESHOLD = 20;
