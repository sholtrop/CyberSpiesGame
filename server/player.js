import { randInt } from "./util.js";

export class Player {
  constructor({ name, connection, status, role }) {
    this.name = name;
    this.connection = connection;
    this.status = status;
    this.role = role;
    this.tasks = [];
    this.color = randomPlayerColor();
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
