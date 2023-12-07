import { nanoid } from "nanoid";
import {
  EMERGENCY_MEETINGS_PER_PLAYER,
  N_TOTAL_TASKS,
  PLAYER_COLORS,
  TASKS,
  TASK_BATCH_SIZE,
} from "./consts.js";
import { randInt } from "./util.js";

export class Player {
  constructor({ name, connection, status, color }) {
    this.name = name;
    this.connection = connection;
    this.status = status;
    this.role = { name: "undecided" };
    this.tasks = [];
    this.color = color || randomPlayerColor();
    this.currentlyDoing = { activity: "nothing" };
    this.emergencyMeetingsLeft = EMERGENCY_MEETINGS_PER_PLAYER;
    this.id = nanoid();
  }

  assignTasks(activities) {
    const pastTasks = new Set(this.tasks.map((t) => t.number));

    // New tasks should not overlap with previous tasks if possible
    const availableTasks = Array.from(Array(N_TOTAL_TASKS).keys())
      .map((idx) => (pastTasks.has(idx) ? null : idx))
      .filter((t) => t !== null);

    const newTasks = new Set();
    while (newTasks.size < TASK_BATCH_SIZE) {
      if (
        availableTasks.length < TASK_BATCH_SIZE &&
        newTasks.size === availableTasks.length
      ) {
        // We need to give a task they've already completed as we don't have enough new tasks
        const taskNr = randInt(0, pastTasks.size - 1);
        const task = Array.from(pastTasks.values())[taskNr];
        newTasks.add(task);
      } else {
        // Give a new task
        const task = randInt(0, availableTasks.length - 1);
        newTasks.add(task);
      }
    }
    this.tasks = [];
    for (const taskNumber of newTasks.values()) {
      const taskName = TASKS[taskNumber].name;
      this.tasks.push({
        name: taskName,
        number: taskNumber,
        description: TASKS[taskNumber].makeDescription(activities),
        status: "available",
      });
    }
  }

  startTask(taskNumber) {
    // Already doing something else
    if (this.currentlyDoing.activity !== "nothing") return;
    const task = this.tasks.find((task) => task.number === taskNumber);
    // Player does not have this task, or task is already completed
    if (task == null || task.status !== "available") return;
    this.currentlyDoing = { activity: "task", number: taskNumber };
  }

  finishTask(taskNumber) {
    if (
      this.currentlyDoing.activity !== "task" &&
      this.role.name !== "impostor"
    )
      return;
    // Task that was finished is not the one that was started
    if (
      this.currentlyDoing.number !== taskNumber &&
      this.role.name !== "impostor"
    )
      return;
    const task = this.tasks.find((task) => task.number === taskNumber);
    if (task == null) return;
    task.status = "completed";
    this.currentlyDoing = { activity: "nothing" };
  }

  startFirewallFix() {
    // Already doing something else
    if (this.currentlyDoing.activity !== "nothing") return;
    this.currentlyDoing = { activity: "fixFirewall" };
  }

  finishFirewallFix() {
    if (this.currentlyDoing.activity !== "fixFirewall") return;
    this.currentlyDoing = { activity: "nothing" };
  }
}

export function randomPlayerColor() {
  const random = randInt(0, PLAYER_COLORS.length - 1);
  return PLAYER_COLORS[random];
}

export function playerNameValid(name) {
  if (name.length < 3)
    return [false, `Name ${name} is too short. Minimum of 3 characters`];
  if (name.length > 16)
    return [false, `Name ${name} is too long. Maximum of 16 characters`];
  if (!/^[a-zA-Z0-9]+$/.test(name))
    return [
      false,
      `Name ${name} contains invalid characters. Only use alphanumeric characters.`,
    ];
  return [true];
}
