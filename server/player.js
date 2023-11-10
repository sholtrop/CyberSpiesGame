export class Player {
  constructor({ name, connection, status, role }) {
    this.name = name;
    this.connection = connection;
    this.status = status;
    this.role = role;
    this.color = randomPlayerColor();
  }
}

const colors = ["green", "blue", "yellow", "white", "red"];

function randomPlayerColor() {
  const randInt = Math.floor(Math.random() * colors.length);
  return colors[randInt];
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
