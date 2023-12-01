import {
  N_TOTAL_TASKS,
  PLAYER_COLORS,
  TASKS,
  TASK_BATCH_SIZE,
} from "./consts.js";
import { randInt } from "./util.js";

export class Player {
  constructor({ name, connection, status, role, color }) {
    this.name = name;
    this.connection = connection;
    this.status = status;
    this.role = role;
    this.tasks = [];
    this.color = color || randomPlayerColor();
    this.currentlyDoing = { activity: "nothing" };
  }

  assignTasks(activities) {
    const pastTasks = new Set(this.tasks.map((t) => t.number));

    // New tasks can not overlap with previous tasks
    const availableTasks = Array.from(Array(N_TOTAL_TASKS).keys())
      .map((idx) => (pastTasks.has(idx) ? null : idx))
      .filter((t) => t !== null);
    const newTasks = new Set();

    while (newTasks.size < TASK_BATCH_SIZE) {
      const task = randInt(0, availableTasks.length);
      newTasks.add(task);
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
    if (this.currentlyDoing.activity !== "task") return;
    // Task that was finished is not the one that was started
    if (this.currentlyDoing.number !== taskNumber) return;
    const task = this.tasks.find((task) => task.number === taskNumber);
    if (task == null) return;
    task.status = "completed";
    this.currentlyDoing = { activity: "nothing" };
  }

  startSabotageFix() {
    // Already doing something else
    if (this.currentlyDoing.activity !== "nothing") return;
    this.currentlyDoing = { activity: "fixSabotage" };
  }

  finishSabotageFix() {
    if (this.currentlyDoing.activity !== "fixSabotage") return;
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
