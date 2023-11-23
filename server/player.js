import { randInt } from "./util.js";

export class Player {
  constructor({ name, connection, status, role }) {
    this.name = name;
    this.connection = connection;
    this.status = status;
    this.role = role;
    this.tasks = [];
    this.color = randomPlayerColor();
    this.currentlyDoing = { activity: "nothing" };
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

const colors = ["green", "blue", "yellow", "white", "red"];

export function randomPlayerColor() {
  const random = randInt(0, colors.length - 1);
  return colors[random];
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
